package cache

import (
    "github.com/gofiber/fiber/v3"
    "strings"
)

const (
    // Vite fingerprints everything in /assets, so a URL's content never changes
    Immutable = "public, max-age=31536000, immutable"
    // Bible text rarely changes; serve from cache for a day, then refresh in the background
    BibleText = "public, max-age=86400, stale-while-revalidate=604800"
    Search    = "public, max-age=3600"
    // index.html, sw.js and the manifest must be checked on every load so deploys show up
    Revalidate = "no-cache"
    NoStore    = "no-store"
)

// Policy returns the Cache-Control value for a request path.
func Policy(path string) string {
    switch {
    case strings.HasPrefix(path, "/assets/"):
        return Immutable
    case strings.HasPrefix(path, "/api/") && strings.HasSuffix(path, "/search"):
        return Search
    case strings.HasPrefix(path, "/api/"):
        return BibleText
    default:
        return Revalidate
    }
}

// New sets Cache-Control on every response. Errors are never cached.
func New() fiber.Handler {
    return func(c fiber.Ctx) error {
        err := c.Next()

        if err != nil || c.Response().StatusCode() >= 400 {
            c.Set(fiber.HeaderCacheControl, NoStore)
        } else {
            c.Set(fiber.HeaderCacheControl, Policy(c.Path()))
        }

        return err
    }
}
