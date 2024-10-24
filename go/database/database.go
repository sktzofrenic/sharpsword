package database

import (
    "database/sql"
    "fmt"
    "log"
)

var db *sql.DB

const (
    host     = "localhost"
    port     = 5432
    user     = "postgres"
    password = "password"
    dbname   = "postgres"
)

type Verse struct {
    text_plain string
    text_formatted string
    version string
    verse_id int
    book int
    chapter int
    verse int
}

// connect function

func Connect() error {
    var err error
    psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
        "password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    db, err = sql.Open("postgres", psqlInfo)
    if err != nil {
        return err
    }

    err = db.Ping()
    if err != nil {
        return err
    }

    log.Println("Successfully connected!")
    return nil
}
