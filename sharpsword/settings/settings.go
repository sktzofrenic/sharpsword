package settings

import (
    "os"
    "github.com/joho/godotenv"
)

type Settings struct {
    Port string
}

func GetSettings() Settings {
    err := godotenv.Load()

    if err != nil {
        panic(err)
    }

    return Settings{
        Port: os.Getenv("PORT"),
    }
}


