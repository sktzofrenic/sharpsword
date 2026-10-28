# SharpSword

SharpSword is a Bible web app written in Go/Vue with a mobile first focus. 

Goals include high performance search (equivalent or faster to native desktop application), and smooth verse navigation. 

Live Implementation: [https://sharpsword.io](https://sharpsword.io)

## Goals

- Fast search with results returned with each keystroke
- Fast navigation using keyboard to any book/chapter/verse
- Mobile first Progressive Web App (PWA) design with responsive layout for desktop
- Amazing Copy/Paste support with customizable formatting
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

### Prerequisites

- [Go](https://golang.org/doc/install)
- [Node.js](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Air](https://github.com/air-verse/air) (optional, for hot reloading the Go server): `go install github.com/air-verse/air@latest`

### Install Dependencies

From the root directory:

```
go mod download
npm install
```

### Database

Create a database, load the schema, and import the KJV text from `data/KJV`. The first line of `data/table_structure.sql` grants access to the production database user, so skip it locally:

```
createdb sharpsword_dev
grep -v '^grant ' data/table_structure.sql | psql -d sharpsword_dev
cd data
psql -d sharpsword_dev <<'SQL'
\copy books from 'KJV/books.tsv' with (format csv, delimiter E'\t', header true)
\copy verses from 'KJV/verses.tsv' with (format csv, delimiter E'\t', header true)
\copy paragraphs from 'KJV/paragraphs.tsv' with (format csv, delimiter E'\t', header true)
\copy descriptions from 'KJV/descriptions.tsv' with (format csv, delimiter E'\t', header true)
\copy headings from 'KJV/headings.tsv' with (format csv, delimiter E'\t', header true)
SQL
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
DATABASE_URL=postgres://localhost:5432/sharpsword_dev
```

## Development

Run the API and the frontend in two terminals from the root directory.

Start the Go API server on port 3000 (or `PORT` from `.env`):

```
air          # with hot reloading
go run .     # without
```

Start the Vite dev server for the Vue frontend:

```
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). When served from `localhost`, the frontend sends API requests to `http://127.0.0.1:3000`.

## Production Build

`npm run build` builds the frontend into `public/`, which the Go server serves as static files alongside the API.

## Tests

Run the tests with `go test ./... -v` in the root directory.
