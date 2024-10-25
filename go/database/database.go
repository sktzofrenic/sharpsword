package database

import (
    "github.com/jackc/pgx/v5"
    "sharpsword/go/settings"
    "context"
)

// Connect to the database

func Connect() (*pgx.Conn, error) {
    conn, err := pgx.Connect(context.Background(), settings.GetSettings().DatabaseURL)
    if err != nil {
        return nil, err
    }
    return conn, nil
}
