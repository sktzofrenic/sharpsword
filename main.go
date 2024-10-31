package main

import (
    "fmt"
    "log"
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/static"
    recoverer "github.com/gofiber/fiber/v3/middleware/recover"
    "github.com/gofiber/fiber/v3/middleware/cors"
    "sharpsword/go/api/bible"
    "sharpsword/go/api/search"
    "sharpsword/go/settings"
    "sharpsword/go/database"
    "github.com/goccy/go-json"
    "os"
)

func main() {
    settings := settings.GetSettings()

    db, err := database.ConnectPool()

    if err != nil {
        fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
        os.Exit(1)
    }

    defer db.Close()

    app := fiber.New(fiber.Config{
        JSONEncoder: json.Marshal,
        JSONDecoder: json.Unmarshal,
    })

    app.Use(recoverer.New())
    app.Use(cors.New())

    app.Get("/*", static.New(("./public")))

    bible.Register(app, db)
    search.Register(app, db)

    fmt.Println("Server is running on port " + settings.Port)

    log.Fatal(app.Listen(":" + settings.Port))
}
