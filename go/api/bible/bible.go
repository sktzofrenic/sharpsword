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
            text_formatted,
            coalesce(headings.heading_plain, '') as heading,
            books.book_name as book,
            verses.verse_id,
            coalesce(paragraphs.verse_id, 0) as paragraph,
            chapter
        FROM verses
            left join books on verses.book = books.book_id
            left join descriptions on verses.verse_id = descriptions.verse_id and descriptions.version = $1
            left join headings on verses.verse_id = headings.verse_id and headings.version = $1
            left join paragraphs on verses.verse_id = paragraphs.verse_id and paragraphs.version = $1
        WHERE verses.version = $1 AND book = $2 AND chapter = $3
        ORDER BY verses.verse_id ASC;
        `

        rows, err := conn.Query(context.Background(), query, version, book, chapter)

        var rowSlice []models.Verse

        for rows.Next() {
            var row models.Verse
            err := rows.Scan(
                &row.T,
                &row.H,
                &row.B,
                &row.ID,
                &row.P,
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
