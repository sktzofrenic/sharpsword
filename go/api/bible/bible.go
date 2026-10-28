package bible

import (
    "github.com/gofiber/fiber/v3"
    "github.com/jackc/pgx/v5/pgxpool"
    "sharpsword/go/models"
    "strconv"
    "fmt"
    "os"
    "context"
    "errors"
    "strings"
    "sync"
    "github.com/goccy/go-json"
)

func Register(app *fiber.App, conn *pgxpool.Pool) {

    app.Get("/api/v1/bible/:version", func(c fiber.Ctx) error {

        query := `
            SELECT
            json_build_object(
                'b',
                json_agg(books)
            ) books
            from
            (
                select
                books.book_name as n,
                books.book_abbreviation as a,
                books.testament as t,
                books.book_id as i,
                coalesce(
                    (
                    SELECT
                        json_agg(
                        row_to_json(verses)
                        )
                    FROM
                        (
                        SELECT
                            count(*) as v
                        FROM
                            verses
                        WHERE
                            verses.book = books.book_id
                        group by
                            chapter
                        order by
                            chapter
                        ) verses
                    ),
                    '[]'
                ) AS c
                from
                    books
                order by
                    books.book_id
            ) books
        `
        var json_data string
        err := conn.QueryRow(context.Background(), query).Scan(&json_data)
        if err != nil {
            fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
            os.Exit(1)
        }

        return c.SendString(
            fmt.Sprintf("%s", json_data),
        )
    })


    app.Get("/api/v1/bible/:version/all", func(c fiber.Ctx) error {
        version := strings.ToUpper(c.Params("version"))

        body, err := allVerses(conn, version)
        if errors.Is(err, errUnknownVersion) {
            return fiber.ErrNotFound
        }
        if err != nil {
            fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
            return fiber.ErrInternalServerError
        }

        c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
        return c.Send(body)
    })

    app.Get("/api/v1/bible/:version/:book/:chapter", func(c fiber.Ctx) error {
        version := strings.ToUpper(c.Params("version"))

        book := c.Params("book")
        book_num, err := strconv.Atoi(book)

        chapter := c.Params("chapter")
        chapter_num, err := strconv.Atoi(chapter)

        // the chapter plus the last verse before it and the first verse after it,
        // which the client uses to link to the previous and next chapters
        query := verseSelect + `
        WHERE verses.version = $1 
        AND verses.verse_id >= (SELECT coalesce(max(verses.verse_id), 0) FROM verses WHERE version = $1 and verse_id < $2 - 1)
        AND verses.verse_id <= (SELECT coalesce(min(verses.verse_id), 66999999) FROM verses WHERE version = $1 and verse_id > $2 + 999)
        ORDER BY verses.verse_id ASC;
        `
        verseId := (book_num * 1000000) + (chapter_num * 1000)

        rowSlice, err := queryVerses(conn, query, version, verseId)
        if err != nil {
            fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
            os.Exit(1)
        }

        return c.JSON(fiber.Map{
            "v": rowSlice,
        })
    })
}

// Columns and joins for models.Verse, shared by the chapter and whole-Bible endpoints
const verseSelect = `SELECT 
            text_formatted,
            coalesce(headings.heading_plain, '') as heading,
            books.book_name as book,
            verses.verse_id,
            verses.book,
            coalesce(paragraphs.verse_id, 0) as paragraph,
            coalesce(descriptions.description_plain, '') as description,
            chapter
        FROM verses
            left join books on verses.book = books.book_id
            left join descriptions on verses.verse_id = descriptions.verse_id and descriptions.version = $1
            left join headings on verses.verse_id = headings.verse_id and headings.version = $1
            left join paragraphs on verses.verse_id = paragraphs.verse_id and paragraphs.version = $1`

func queryVerses(conn *pgxpool.Pool, query string, args ...any) ([]models.Verse, error) {
    rows, err := conn.Query(context.Background(), query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var rowSlice []models.Verse

    for rows.Next() {
        var row models.Verse
        err := rows.Scan(
            &row.T,
            &row.H,
            &row.B,
            &row.ID,
            &row.BID,
            &row.P,
            &row.D,
            &row.C,
        )
        if err != nil {
            fmt.Fprintf(os.Stderr, "Scan failed: %v\n", err)
        }
        rowSlice = append(rowSlice, row)
    }

    return rowSlice, rows.Err()
}

// The whole Bible is about 14 MB of JSON and never changes while the server runs,
// so it is built once per version and kept in memory.
var errUnknownVersion = errors.New("unknown version")

var (
    allVersesMu    sync.Mutex
    allVersesCache = map[string][]byte{}
)

func allVerses(conn *pgxpool.Pool, version string) ([]byte, error) {
    allVersesMu.Lock()
    defer allVersesMu.Unlock()

    if body, ok := allVersesCache[version]; ok {
        return body, nil
    }

    rowSlice, err := queryVerses(conn, verseSelect+`
        WHERE verses.version = $1
        ORDER BY verses.verse_id ASC;
    `, version)
    if err != nil {
        return nil, err
    }
    if len(rowSlice) == 0 {
        return nil, errUnknownVersion
    }

    body, err := json.Marshal(fiber.Map{"v": rowSlice})
    if err != nil {
        return nil, err
    }

    allVersesCache[version] = body
    return body, nil
}
