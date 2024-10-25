package bible

import (
    "github.com/gofiber/fiber/v3"
    "sharpsword/go/database"
    "sharpsword/go/models"
    "strconv"
    "fmt"
    "os"
    "context"
    "strings"
)

func Register(app *fiber.App) {
    app.Get("/api/v1/bible/:version/:book/:chapter", func(c fiber.Ctx) error {
        version := strings.ToUpper(c.Params("version"))

        book := c.Params("book")

        if book, err := strconv.Atoi(book); err != nil {
            return c.JSON(fiber.Map{
                "status": "error",
                "message": fmt.Sprintf("Book must be a number instead %d was provided", book),
            })
        } 

        chapter := c.Params("chapter")

        if chapter, err := strconv.Atoi(chapter); err != nil {
            return c.JSON(fiber.Map{
                "status": "error",
                "message": fmt.Sprintf("Chapter must be a number instead %d was provided", chapter),
            })
        }

        conn, err := database.Connect()

        if err != nil {
            fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
            os.Exit(1)
        }

        defer conn.Close(context.Background())

        query := `SELECT 
            verse_id,
            text_formatted
        FROM verses WHERE version = $1 AND book = $2 AND chapter = $3`

        rows, err := conn.Query(context.Background(), query, version, book, chapter)

        var rowSlice []models.Verse

        for rows.Next() {
            var row models.Verse
            err := rows.Scan(
                &row.ID,
                &row.T,
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
