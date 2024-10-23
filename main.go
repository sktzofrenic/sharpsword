package main

import (
    "fmt"
    "log"
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/static"
    "sharpsword/sharpeners/api/bible"
    "sharpsword/sharpeners/settings"
)

func main() {
    app := fiber.New()

    app.Get("/public/*", static.New(("./public")))

    bible.Register(app)

    app.Get("/", func(c fiber.Ctx) error {
        return c.SendString("Hello, World 👋!")
    })

    settings := settings.GetSettings()
    fmt.Println("Server is running on port " + settings.Port)

    log.Fatal(app.Listen(":" + settings.Port))
}
