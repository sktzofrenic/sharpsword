package database

import (
    "github.com/jackc/pgx/v5"
    "sharpsword/go/settings" 
    "context"
    "github.com/jackc/pgx/v5/pgxpool"
)

// Connect to the database

func ConnectPool() (*pgxpool.Pool, error) {
    dbpool, err := pgxpool.New(context.Background(), settings.GetSettings().DatabaseURL)
    if err != nil {
        return nil, err
    }
    return dbpool, nil
}

func Connect() (*pgx.Conn, error) {
    conn, err := pgx.Connect(context.Background(), settings.GetSettings().DatabaseURL)
    if err != nil {
        return nil, err
    }
    return conn, nil
}
