package search

import (
    "github.com/gofiber/fiber/v3"
    "sharpsword/go/database"
    "sharpsword/go/models"
    "fmt"
    "os"
    "context"
    "strings"
)

func Register(app *fiber.App) {
    app.Get("/api/v1/bible/:version/search", func(c fiber.Ctx) error {

        searchTerm := c.Query("q")
        version := strings.ToUpper(c.Params("version"))

        conn, err := database.Connect()

        if err != nil {
            fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
            os.Exit(1)
        }

        defer conn.Close(context.Background())

        query := `
                SELECT
                verse_id, b.book_name, b.testament, b.book_id, chapter, verse, ts_headline(text_plain, q, 'MinWords=40,MaxWords=50'), rank as result_rank
                FROM (
                SELECT
                    verse_id, book, chapter, verse, text_plain, ts_rank(ts_vec, q) as rank, q
                FROM
                    verses, plainto_tsquery($1) q

                WHERE
                    verses.ts_vec @@ q
                    and verses.version = $2
                ORDER BY
                    rank DESC
                    LIMIT
                200
                ) search
                join books b on b.book_id = search.book
                ORDER BY
                rank DESC;
        `
        rows, err := conn.Query(context.Background(), query, searchTerm, version)

        var rowSlice = []models.SearchResult{}
        for rows.Next() {
            var row models.SearchResult
            err = rows.Scan(
                &row.ID,
                &row.B,
                &row.T,
                &row.BID,
                &row.C,
                &row.V,
                &row.H,
                &row.R,
            )
            if err != nil {
                fmt.Fprintf(os.Stderr, "Unable to scan row: %v\n", err) 
                os.Exit(1)
            }
            rowSlice = append(rowSlice, row)
        }

        return c.JSON(fiber.Map{
            "r": rowSlice,
        })
    })
}
