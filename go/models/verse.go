package models

// We are being terse on purpose to minimize the JSON payload to the browser
type Verse struct {
    T string // Verse.text_formatted
    H string // Verse.heading
    B string // Verse.book_name
    BID string // Verse.book
    D string // Verse.description
    ID int // Verse.verse_id
    P int // Verse.paragraph
    C int // Verse.chapter
}

