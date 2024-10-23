package settings

import (
    "os"
    "github.com/joho/godotenv"
)

// provide exportable struct with environment variables

type Settings struct {
    Port string
}

// provide function to get environment variables

func GetSettings() Settings {
    err := godotenv.Load()

    if err != nil {
        panic(err)
    }

    return Settings{
        Port: os.Getenv("PORT"),
    }
}


