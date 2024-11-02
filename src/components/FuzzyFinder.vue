<template>
    <div class="relative w-full pr-4">
        <label for="name" class="absolute -top-3 left-4 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md">
            Text Verse Lookup
        </label>
        <input 
            type="text" 
            class="bg-slate-900 text-slate-200 border-slate-700 focus:border-slate-500 rounded-lg py-1 px-2 w-full mx-2 focus:outline-none focus:ring-0 focus:ring-slate-800" 
            placeholder="Genesis 1:1 / 1jn2 / rev 3 / 2sam 8:12 / + enter..." 
            v-model="reference"
            @keydown.enter="textSearch">
    </div>
</template>

<script setup>
import { ref } from 'vue'
import books from '@/assets/bible/books.json'

const emits = defineEmits(['verseSelected'])
const reference = ref('')
const bookId = ref('')
const book = ref('')
const chapter = ref('')


const textSearch = (event) => {
    let bookName = reference.value.match(/[a-zA-Z]+/g)
    let parts = reference.value.split(bookName)
    let foundChapter, verse, bookOrdinal

    // Handle chapter and verse parsing
    let chapterVerse = (parts.length === 1 ? parts[0] : parts[1]).split(':')
    bookOrdinal = parts.length === 1 ? null : parts[0].trim()
    foundChapter = chapterVerse[0].trim()
    verse = chapterVerse.length > 1 ? chapterVerse[1].trim() : null

    // Build book name and search for match
    bookName = `${bookOrdinal ? bookOrdinal + ' ' : ''}${bookName}`
    let bookAbbreviation = `${bookOrdinal ? bookOrdinal + ' ' : ''}${bookName.slice(0, 3)}`
    let bookData = books.find(b => 
        b.bookName.toLowerCase().includes(bookName.toLowerCase()) || 
        b.bookAbbreviation.toLowerCase().includes(bookAbbreviation.toLowerCase())
    )

    if (bookData) {
        bookId.value = bookData.bookId
        book.value = bookData.name
    } else {
        // look for a book in bookData that includes the same letters of bookName in any order
        let fuzzyBook = books.find(b => bookName.toLowerCase().split('').every(letter => b.bookName.toLowerCase().includes(letter)))
        if (fuzzyBook) {
            bookId.value = fuzzyBook.bookId
            book.value = fuzzyBook.name
        }
    }

    chapter.value = parseInt(foundChapter || 1)
    var verseId = parseInt(`${bookId.value}${String(chapter.value).padStart(3, '0')}${String(verse || 1).padStart(3, '0')}`)
    reference.value = ''
    emits('verseSelected', {
        bookId: bookId.value,
        book: book.value,
        chapter: chapter.value,
        verse: verse || 1,
    })
}
</script>
