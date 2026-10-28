// Saving the whole Bible for offline reading. Chapters are written into the same
// cache the service worker serves chapter requests from, so the reader needs no
// changes to use them.

// must match the runtime cache for Bible text in vite.config.js
export const BIBLE_CACHE = 'bible-text'
export const CHAPTER_COUNT = 1189

const VERSION = 'kjv'

export const chapterUrl = (baseUrl, bookId, chapter) => `${baseUrl}/api/v1/bible/${VERSION}/${bookId}/${chapter}`

const CHAPTER_URL = new RegExp(`/api/v1/bible/${VERSION}/\\d+/\\d+$`)

// Split all verses (in verse_id order) into the same responses the chapter
// endpoint returns: a chapter's verses plus the last verse before it and the
// first verse after it, which the reader uses for previous and next.
export const splitIntoChapters = (verses) => {
    const chapters = []
    let start = 0
    for (let i = 1; i <= verses.length; i++) {
        if (i === verses.length || verses[i].BID !== verses[start].BID || verses[i].C !== verses[start].C) {
            chapters.push({
                bookId: verses[start].BID,
                chapter: verses[start].C,
                body: { v: verses.slice(Math.max(start - 1, 0), i + 1) },
            })
            start = i
        }
    }
    return chapters
}

export const canSaveOffline = () => typeof window !== 'undefined' && 'caches' in window

// Ask the browser not to clear this site's storage (saved chapters, plans,
// highlights, history) when the device runs low on space. Chrome decides
// without prompting and usually agrees for installed apps.
export const requestPersistentStorage = async () => {
    try {
        if (await navigator.storage?.persisted?.()) {
            return true
        }
        return (await navigator.storage?.persist?.()) ?? false
    } catch (error) {
        console.error(error)
        return false
    }
}

export const savedChapterCount = async (baseUrl) => {
    // caches.open would create the cache, so check for it first
    if (!canSaveOffline() || !(await caches.has(BIBLE_CACHE))) {
        return 0
    }
    const cache = await caches.open(BIBLE_CACHE)
    const keys = await cache.keys()
    const count = keys.filter(request => request.url.startsWith(baseUrl) && CHAPTER_URL.test(request.url)).length
    return Math.min(count, CHAPTER_COUNT)
}

// onProgress receives { phase: 'downloading' } and then { phase: 'saving', saved, total }
export const saveBibleOffline = async (baseUrl, onProgress = () => {}) => {
    onProgress({ phase: 'downloading' })
    const response = await fetch(`${baseUrl}/api/v1/bible/${VERSION}/all`)
    if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`)
    }
    const { v } = await response.json()
    const chapters = splitIntoChapters(v)

    const cache = await caches.open(BIBLE_CACHE)
    const batchSize = 50
    for (let i = 0; i < chapters.length; i += batchSize) {
        await Promise.all(chapters.slice(i, i + batchSize).map(c => cache.put(
            chapterUrl(baseUrl, c.bookId, c.chapter),
            new Response(JSON.stringify(c.body), { headers: { 'Content-Type': 'application/json' } }),
        )))
        onProgress({ phase: 'saving', saved: Math.min(i + batchSize, chapters.length), total: chapters.length })
    }

    // the book and chapter list used by the verse picker
    await cache.add(`${baseUrl}/api/v1/bible/${VERSION}`)

    await requestPersistentStorage()
}

export const removeBibleOffline = () => caches.delete(BIBLE_CACHE)
