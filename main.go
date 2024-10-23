package main

import (
    "log"
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/static"
    "sharpsword/sharpsword/api/bible"
)

func main() {
    app := fiber.New()

    app.Get("/public/*", static.New(("./public")))

    bible.Register(app)

    app.Get("/", func(c fiber.Ctx) error {
        return c.SendString("Hello, World 👋!")
    })

    log.Fatal(app.Listen(":3000"))
}
