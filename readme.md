# SharpSword

SharpSword is a Bible web app written in Go/Vue with a focus of fast search and navigation. 

## Goals

- Fast search with results returned with each keystroke
- Fast navigation using keyboard to any book/chapter/verse
- Mobile first Progressive Web App (PWA) design with responsive layout for desktop
- Amazing Copy/Paste support with customizable formatting
- Verse highlighting and note taking
- Data export and import for easy transition to self hosting

![SharpSword](./logo/sword_zoom_sq_512.png)

## Setup

### Install Go

Install Go from the [official website](https://golang.org/doc/install).

### Install Air

Install _air_ for hot reloading with `go get -u github.com/cosmtrek/air`.

### Install Node.js

Install Node.js from the [official website](https://nodejs.org/en/download/).

### Install Vue CLI

Install Vue CLI with `npm install -g @vue/cli`.

### Install Dependencies

Install the Go dependencies with `go mod download` in the root directory.

Install the Vue dependencies with `npm install` in the `client` directory.

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=3000
```

## Start the Server

To start the server, run `go run main.go` in the root directory. The server will start on port 3000 or whatever is set in your `.env` file.

To start the server with hot reloading, first install _air_ and then run `air` in the root directory.


## Tests

Run the tests with `go test ./... -v` in the root directory.
