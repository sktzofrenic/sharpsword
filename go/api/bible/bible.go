package bible

import (
    "github.com/gofiber/fiber/v3"
)

func Register(app *fiber.App) {
    app.Get("/api/v1/bible", func(c fiber.Ctx) error {
        // Connect with database
        if err := Connect(); err != nil {
            log.Fatal(err)
        }
        return c.JSON(fiber.Map{
            "message": "Hello, World 📖!",
        })
    })
}
