import dayjs from 'dayjs'
import { BOOKS_BY_USFM, BOOKS_BY_ID } from '@/assets/js/books.js'

// Plans that ship with the app. Templates are loaded on demand so they
// don't add to the main bundle.
export const PLAN_CATALOG = [
    {
        slug: 'as-it-happened',
        title: 'As It Happened',
        description: 'Read through the whole Bible in a year, in the order the events happened.',
        attribution: 'Reading order from the "As It Happened" plan by Mountain View Fellowship.',
        length: 365,
        load: () => import('@/assets/plans/as-it-happened.json'),
    },
]

const DATE_FORMAT = 'YYYY-MM-DD'

const newId = () => {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID()
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const verseId = (bookId, chapter, verse) => bookId * 1000000 + chapter * 1000 + verse

// Parse a USFM reference like "GEN.1", "PSA.119.1-88" or "2SA.5.4" into a plan passage.
export const parseUsfm = (usfm) => {
    const match = /^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/.exec(usfm)
    const book = match && BOOKS_BY_USFM[match[1]]
    if (!book) {
        throw new Error(`Unrecognized reference: ${usfm}`)
    }
    const chapter = parseInt(match[2])
    const startVerse = match[3] ? parseInt(match[3]) : null
    const endVerse = match[4] ? parseInt(match[4]) : startVerse

    let reference = `${book.name} ${chapter}`
    if (startVerse) {
        reference += endVerse !== startVerse ? `:${startVerse}-${endVerse}` : `:${startVerse}`
    }

    return {
        usfm,
        reference,
        start_verse_id: verseId(book.id, chapter, startVerse || 1),
        end_verse_id: verseId(book.id, chapter, endVerse || 999),
        completedOn: null,
    }
}

// Build a user's copy of a plan template, starting today.
export const createPlan = (template) => {
    return {
        id: newId(),
        slug: template.slug,
        title: template.title,
        description: template.description,
        attribution: template.attribution,
        startDate: dayjs().format(DATE_FORMAT),
        days: template.days.map((usfms, index) => ({
            day: index + 1,
            passages: usfms.map(parseUsfm),
        })),
    }
}

// Give plans saved or imported by older versions an id, and drop exact duplicates.
export const normalizePlans = (plans) => {
    const seen = new Set()
    return (plans || []).filter(plan => {
        if (!plan.id) {
            plan.id = newId()
        }
        const key = `${plan.id}|${plan.title}|${plan.startDate}`
        if (seen.has(plan.id) || seen.has(key)) {
            return false
        }
        seen.add(plan.id)
        seen.add(key)
        return true
    })
}

export const planStartDate = (plan) => dayjs(plan.startDate || undefined).startOf('day')

export const dayDate = (plan, day) => planStartDate(plan).add(day - 1, 'day')

// The day the schedule says to read today, clamped to the plan's length.
export const todaysDay = (plan) => {
    const day = dayjs().startOf('day').diff(planStartDate(plan), 'day') + 1
    return Math.min(Math.max(day, 1), plan.days.length)
}

// A day with no readings counts as complete so it never leaves a plan "behind"
export const isDayComplete = (day) => day.passages.every(p => p.completedOn)

export const isDayStarted = (day) => day.passages.some(p => p.completedOn)

export const firstIncompleteDay = (plan) => plan.days.find(d => !isDayComplete(d))?.day ?? null

// How many scheduled days before today are not finished yet.
export const daysBehind = (plan) => {
    const today = todaysDay(plan)
    return plan.days.filter(d => d.day < today && !isDayComplete(d)).length
}

export const completedDays = (plan) => plan.days.filter(d => d.passages.length > 0 && isDayComplete(d)).length

export const progressPercentage = (plan) => {
    const passages = plan.days.flatMap(d => d.passages)
    if (passages.length === 0) {
        return 0
    }
    return Math.round((passages.filter(p => p.completedOn).length / passages.length) * 100)
}

// Where to send the reader for a passage.
export const passageLocation = (passage) => {
    const bookId = Math.floor(passage.start_verse_id / 1000000)
    const chapter = Math.floor(passage.start_verse_id / 1000) % 1000
    const verse = passage.start_verse_id % 1000
    return {
        bookId,
        book: BOOKS_BY_ID[bookId]?.name ?? '',
        chapter,
        verse,
        wholeChapter: verse === 1 && passage.end_verse_id % 1000 === 999,
    }
}
