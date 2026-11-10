// Checks the bundled reading plans in src/assets/plans: every reference must
// parse and point at a real chapter, no day may be empty, and every chapter the
// plan covers must be read at least once. A plan covers the whole Bible unless
// its "covers" field names a range of books, like "MAT-REV" or "PSA".
// Run with `npm run validate:plans`.
import { readFileSync, readdirSync } from 'node:fs'
import { BOOKS, BOOKS_BY_USFM } from '../src/assets/js/books.js'

const PLAN_DIR = new URL('../src/assets/plans/', import.meta.url)
const USFM = /^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/

let failed = false

for (const file of readdirSync(PLAN_DIR).filter(f => f.endsWith('.json'))) {
    const { days, covers = 'GEN-REV' } = JSON.parse(readFileSync(new URL(file, PLAN_DIR)))
    const errors = []
    const covered = new Set()

    const [first, last = first] = covers.split('-').map(usfm => BOOKS_BY_USFM[usfm])
    if (!first || !last || first.id > last.id) {
        console.error(`${file}:\n  bad "covers" range: ${covers}`)
        failed = true
        continue
    }
    const books = BOOKS.filter(book => book.id >= first.id && book.id <= last.id)

    days.forEach((usfms, index) => {
        if (usfms.length === 0) {
            errors.push(`day ${index + 1} has no readings`)
        }
        for (const usfm of usfms) {
            const match = USFM.exec(usfm)
            const book = match && BOOKS_BY_USFM[match[1]]
            const chapter = match && parseInt(match[2])
            if (!book || chapter < 1 || chapter > book.chapters) {
                errors.push(`day ${index + 1}: bad reference ${usfm}`)
                continue
            }
            if (book.id < first.id || book.id > last.id) {
                errors.push(`day ${index + 1}: ${usfm} is outside ${covers}`)
            }
            covered.add(`${book.usfm}.${chapter}`)
        }
    })

    const missing = books.flatMap(book =>
        Array.from({ length: book.chapters }, (_, i) => `${book.usfm}.${i + 1}`)
    ).filter(ref => !covered.has(ref))
    if (missing.length > 0) {
        errors.push(`chapters never read: ${missing.join(', ')}`)
    }

    if (errors.length > 0) {
        failed = true
        console.error(`${file}:\n  ${errors.join('\n  ')}`)
    } else {
        console.log(`${file}: ${days.length} days, all ${covered.size} chapters of ${covers} covered`)
    }
}

process.exit(failed ? 1 : 0)
