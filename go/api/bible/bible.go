package bible

import (
    "github.com/gofiber/fiber/v3"
    "sharpsword/go/database"
    "fmt"
    "os"
    "context"
)

func Register(app *fiber.App) {
    app.Get("/api/v1/bible", func(c fiber.Ctx) error {
        conn, err := database.Connect()

        if err != nil {
            fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
            os.Exit(1)
        }

        defer conn.Close(context.Background())

        rows, err := conn.Query(context.Background(), "SELECT * FROM verses LIMIT 1")

        var rowSlice []string

        for rows.Next() {
            type rowType struct {
                text_plain string
                text_formatted string
                version string
                verse_id int
                book int
                chapter int
                verse int
            }
            var row rowType
            err := rows.Scan(&row.verse_id, &row.book, &row.chapter, &row.verse, &row.text_plain, &row.text_formatted, &row.version)
            if err != nil {
                fmt.Fprintf(os.Stderr, "Scan failed: %v\n", err)
            }
            rowSlice = append(rowSlice, row.text_plain)
        }
        
        if err != nil {
            fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
            os.Exit(1)
        }

        return c.JSON(fiber.Map{
            "status": "success",
            "verses": rowSlice,
        })
    })
}
