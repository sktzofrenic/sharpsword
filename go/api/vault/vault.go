// Package vault stores encrypted sync snapshots for anonymous backup and sync.
//
// The browser derives a vault id and an encryption key from the user's sync key.
// Only the vault id is sent here, and only a hash of it is stored, alongside the
// already-encrypted snapshot, so the server can neither read the data nor recover
// the key. Merging happens in the browser: writes must name the version they were
// based on, and a stale write gets the current copy back to merge and retry.
package vault

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "errors"
    "fmt"
    "os"
    "strconv"
    "time"

    "github.com/goccy/go-json"
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/limiter"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

const (
    // Header carrying the hex vault id; kept out of the URL so it stays out of access logs
    Header = "X-Sync-Vault"
    // Largest encrypted snapshot accepted. Heavy use is ~30 KB.
    MaxSize = 1 << 20
)

const schema = `
    CREATE TABLE IF NOT EXISTS sync_vaults (
        id_hash    bytea primary key,
        version    bigint not null,
        data       bytea not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    )`

// Snapshot is a vault's encrypted data at a version. Version 0 means no vault.
// Data is left out when the client already has this version.
type Snapshot struct {
    Version int64  `json:"version"`
    Data    []byte `json:"data,omitempty"`
}

type putRequest struct {
    BaseVersion int64  `json:"baseVersion"`
    Data        []byte `json:"data"`
}

func Register(app *fiber.App, conn *pgxpool.Pool) {
    if _, err := conn.Exec(context.Background(), schema); err != nil {
        fmt.Fprintf(os.Stderr, "Unable to create sync_vaults table, sync will not work: %v\n", err)
    }

    sync := app.Group("/api/v1/sync", limiter.New(limiter.Config{
        Max:        120,
        Expiration: time.Minute,
        KeyGenerator: func(c fiber.Ctx) string {
            return c.Get(Header)
        },
    }))

    // ?known=<version> skips sending data the client already has
    sync.Get("/", func(c fiber.Ctx) error {
        id, err := IDHash(c.Get(Header))
        if err != nil {
            return fiber.NewError(fiber.StatusBadRequest, err.Error())
        }
        known, err := strconv.ParseInt(c.Query("known", "-1"), 10, 64)
        if err != nil {
            return fiber.NewError(fiber.StatusBadRequest, "invalid known version")
        }

        snapshot, err := load(conn, id, known)
        if err != nil {
            return err
        }
        return c.JSON(snapshot)
    })

    sync.Put("/", func(c fiber.Ctx) error {
        id, err := IDHash(c.Get(Header))
        if err != nil {
            return fiber.NewError(fiber.StatusBadRequest, err.Error())
        }

        var req putRequest
        if err := json.Unmarshal(c.Body(), &req); err != nil || len(req.Data) == 0 || req.BaseVersion < 0 {
            return fiber.NewError(fiber.StatusBadRequest, "expected baseVersion and data")
        }
        if len(req.Data) > MaxSize {
            return fiber.NewError(fiber.StatusRequestEntityTooLarge, "sync data is too large")
        }

        version, err := save(conn, id, req)
        if err != nil {
            return err
        }
        if version > 0 {
            return c.JSON(Snapshot{Version: version})
        }

        // someone else wrote first: send the current copy to merge and retry
        current, err := load(conn, id, -1)
        if err != nil {
            return err
        }
        return c.Status(fiber.StatusConflict).JSON(current)
    })

    sync.Delete("/", func(c fiber.Ctx) error {
        id, err := IDHash(c.Get(Header))
        if err != nil {
            return fiber.NewError(fiber.StatusBadRequest, err.Error())
        }
        if _, err := conn.Exec(context.Background(), `DELETE FROM sync_vaults WHERE id_hash = $1`, id); err != nil {
            return err
        }
        return c.SendStatus(fiber.StatusNoContent)
    })
}

// IDHash checks a hex vault id from the client and returns the hash it is stored under.
func IDHash(header string) ([]byte, error) {
    raw, err := hex.DecodeString(header)
    if err != nil || len(raw) != 32 {
        return nil, errors.New("missing or invalid " + Header + " header")
    }
    sum := sha256.Sum256(raw)
    return sum[:], nil
}

func load(conn *pgxpool.Pool, id []byte, known int64) (Snapshot, error) {
    var snapshot Snapshot
    err := conn.QueryRow(context.Background(), `
        SELECT version, CASE WHEN version = $2 THEN NULL ELSE data END
            FROM sync_vaults
            WHERE id_hash = $1`,
        id, known,
    ).Scan(&snapshot.Version, &snapshot.Data)
    if errors.Is(err, pgx.ErrNoRows) {
        return Snapshot{}, nil
    }
    return snapshot, err
}

// save writes the snapshot if the vault is still at the client's base version,
// returning the new version, or 0 when it has moved on.
func save(conn *pgxpool.Pool, id []byte, req putRequest) (int64, error) {
    ctx := context.Background()

    if req.BaseVersion == 0 {
        tag, err := conn.Exec(ctx, `
            INSERT INTO sync_vaults (id_hash, version, data)
                VALUES ($1, 1, $2)
                ON CONFLICT (id_hash) DO NOTHING`,
            id, req.Data,
        )
        if err != nil || tag.RowsAffected() == 0 {
            return 0, err
        }
        return 1, nil
    }

    var version int64
    err := conn.QueryRow(ctx, `
        UPDATE sync_vaults
            SET version = version + 1, data = $2, updated_at = now()
            WHERE id_hash = $1 AND version = $3
            RETURNING version`,
        id, req.Data, req.BaseVersion,
    ).Scan(&version)
    if errors.Is(err, pgx.ErrNoRows) {
        return 0, nil
    }
    return version, err
}
