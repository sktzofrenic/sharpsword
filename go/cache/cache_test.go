package cache

import (
    "net/http/httptest"
    "testing"

    "github.com/gofiber/fiber/v3"
)

func TestPolicy(t *testing.T) {
    cases := map[string]string{
        "/":                                Revalidate,
        "/index.html":                      Revalidate,
        "/sw.js":                           Revalidate,
        "/manifest.webmanifest":            Revalidate,
        "/assets/index-s1blcJlt.js":        Immutable,
        "/api/v1/bible/kjv":                BibleText,
        "/api/v1/bible/kjv/43/3":           BibleText,
        "/api/v1/bible/kjv/search":         Search,
        "/api/v1/sync":                     NoStore,
        "/api/v1/sync/":                    NoStore,
    }

    for path, want := range cases {
        if got := Policy(path); got != want {
            t.Errorf("Policy(%q) = %q, want %q", path, got, want)
        }
    }
}

func TestErrorsAreNotCached(t *testing.T) {
    app := fiber.New()
    app.Use(New())
    app.Get("/api/v1/bible/kjv/1/1", func(c fiber.Ctx) error {
        return c.SendString("ok")
    })

    ok, err := app.Test(httptest.NewRequest("GET", "/api/v1/bible/kjv/1/1", nil))
    if err != nil {
        t.Fatal(err)
    }
    if got := ok.Header.Get(fiber.HeaderCacheControl); got != BibleText {
        t.Errorf("200 response Cache-Control = %q, want %q", got, BibleText)
    }

    missing, err := app.Test(httptest.NewRequest("GET", "/api/v1/bible/kjv/1/1000", nil))
    if err != nil {
        t.Fatal(err)
    }
    if got := missing.Header.Get(fiber.HeaderCacheControl); got != NoStore {
        t.Errorf("404 response Cache-Control = %q, want %q", got, NoStore)
    }
}
