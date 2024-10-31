package bible

import (
    "github.com/gofiber/fiber/v3"
    "github.com/jackc/pgx/v5/pgxpool"
    "sharpsword/go/models"
    "strconv"
    "fmt"
    "os"
    "context"
    "strings"
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

    app.Get("/api/v1/bible/:version/:book/:chapter", func(c fiber.Ctx) error {
        version := strings.ToUpper(c.Params("version"))

        book := c.Params("book")
        book_num, err := strconv.Atoi(book)

        chapter := c.Params("chapter")
        chapter_num, err := strconv.Atoi(chapter)

        query := `SELECT 
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
            left join paragraphs on verses.verse_id = paragraphs.verse_id and paragraphs.version = $1
        WHERE verses.version = $1 
        AND verses.verse_id >= (SELECT coalesce(max(verses.verse_id), 0) FROM verses WHERE version = $1 and verse_id < $2 - 1)
        AND verses.verse_id <= (SELECT min(verses.verse_id) FROM verses WHERE version = $1 and verse_id > $2 + 999)
        ORDER BY verses.verse_id ASC;
        `
        verseId := (book_num * 1000000) + (chapter_num * 1000)

        rows, err := conn.Query(context.Background(), query, version, verseId)

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
        
        if err != nil {
            fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
            os.Exit(1)
        }


        return c.JSON(fiber.Map{
            "v": rowSlice,
        })
    })
}
