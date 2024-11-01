# SharpSword

SharpSword is a Bible web app written in Go/Vue with a mobile first focus. 

Goals include high performance search (equivalent or faster to native desktop application), and smooth verse navigation. 

Live Implementation: [https://sharpsword.io](https://sharpsword.io)

## Goals

- Fast search with results returned with each keystroke
- Fast navigation using keyboard to any book/chapter/verse
- Mobile first Progressive Web App (PWA) design with responsive layout for desktop
- Verse highlighting and verse selections with sharing options
- Data export and import for easy transition to self hosting

![SharpSword](https://sharpsword.io/assets/sword_zoom_sq_512-BZyze98q.png)

## Performance

For these tests, the Go webserver running on a 2 CPU (shared), 4 GB RAM linode instance. 

The data below simulates retrieving a chapter 20,000 times at a concurrency of 100 requests. 
![image](https://github.com/user-attachments/assets/b24df99e-45a5-4b90-bc09-23afab310e94)

The data below simulates 20,000 searches through the full Bible text for the word "Jesus" at a concurrency of 100 requests.
![image](https://github.com/user-attachments/assets/8171b2fc-01c6-4333-a267-d195cb9be7f5)

*The goal is to host this application free forever.* Please consider supporting the project by [donating](https://venmo.com/DanSafee).

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
