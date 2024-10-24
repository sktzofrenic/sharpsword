package main

import (
    "fmt"
    "log"
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/static"
    "sharpsword/go/api/bible"
    "sharpsword/go/settings"
)

func main() {
    settings := settings.GetSettings()

    app := fiber.New()

    app.Get("/*", static.New(("./public")))

    bible.Register(app, settings.DatabaseURL)

    app.Get("/", func(c fiber.Ctx) error {

        return c.SendString("Hello, World 👋!")
    })

    fmt.Println("Server is running on port " + settings.Port)

    log.Fatal(app.Listen(":" + settings.Port))
}
