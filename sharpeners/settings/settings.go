package settings

import (
    "os"
    "github.com/joho/godotenv"
    "log"
)

func getEnv(key, fallback string) string {
    value, exists := os.LookupEnv(key)
    if !exists {
        value = fallback
    }
    return value
}

type Settings struct {
    Port string
}

func GetSettings() Settings {
    err := godotenv.Load()

    if err != nil {
        log.Fatal("Error loading .env file")
    }

    return Settings{
        Port: getEnv("PORT", "3000"),
    }
}


