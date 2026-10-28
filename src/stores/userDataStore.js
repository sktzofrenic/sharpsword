import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as records from '@/assets/js/records.js'
import { normalizePlans, parseUsfm } from '@/assets/js/plans.js'

// Highlights, history and reading plans, read and written through records so
// they merge between tabs and devices. Views keep the shapes the components
// and export files have always used.

// data saved by versions before records, moved over on first load
const LEGACY_KEYS = { highlights: 'highlightedVerses', history: 'history', plans: 'plans' }
const LEGACY_BACKUP = 'ss.legacy-backup'

const historyKey = (entry) => `hist:${entry.timestamp}:${entry.bookId}.${entry.chapter}.${entry.verse}`
const passageKey = (planId, day, index) => `plan:${planId}:${day}:${index}`
// ids end up inside record keys, which use ':' as a separator
const planId = (id) => String(id).replace(/:/g, '-')

// A plan's schedule is stored with it, so later catalog edits can't shift a
// plan in progress. Catalog passages keep just their USFM reference.
const passageSpec = (passage) => {
    if (passage.usfm) {
        try {
            parseUsfm(passage.usfm)
            return passage.usfm
        } catch {
            // fall through and keep the full passage
        }
    }
    return { reference: passage.reference, start_verse_id: passage.start_verse_id, end_verse_id: passage.end_verse_id }
}

const expandPassage = (spec) => {
    if (typeof spec === 'string') {
        try {
            return parseUsfm(spec)
        } catch {
            return { usfm: spec, reference: spec, start_verse_id: 0, end_verse_id: 0, completedOn: null }
        }
    }
    return { ...spec, completedOn: null }
}

const isHistoryEntry = (e) => e && typeof e.timestamp === 'string' && e.bookId && e.chapter && e.verse
const isHighlight = (h) => h && h.verseId && h.color
const isPlan = (p) => p && Array.isArray(p.days)

export const useUserDataStore = defineStore('userData', () => {
    // bumped per kind of record, so a new highlight doesn't rebuild every plan
    const revisions = ref({ h: 0, hist: 0, plan: 0 })

    records.subscribe(({ keys }) => {
        const kinds = new Set(keys.map(key => key.split(':')[0]))
        kinds.forEach(kind => {
            if (kind in revisions.value) {
                revisions.value[kind]++
            }
        })
    })

    // verseId -> highlight
    const highlightMap = computed(() => {
        revisions.value.h
        const map = new Map()
        for (const [, highlight] of records.entries('h:')) {
            map.set(highlight.verseId, highlight)
        }
        return map
    })

    // newest first
    const highlights = computed(() => {
        return [...highlightMap.value.values()].sort((a, b) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')))
    })

    // newest first
    const history = computed(() => {
        revisions.value.hist
        return [...records.entries('hist:')].sort(([a], [b]) => b.localeCompare(a)).map(([, entry]) => entry)
    })

    const plans = computed(() => {
        revisions.value.plan
        return [...records.entries('plan:')]
            .filter(([key]) => key.split(':').length === 2)
            .map(([key, meta]) => {
                const id = key.slice('plan:'.length)
                return {
                    id,
                    slug: meta.slug,
                    title: meta.title,
                    description: meta.description,
                    attribution: meta.attribution,
                    startDate: meta.startDate,
                    added: meta.added,
                    days: (meta.days || []).map((specs, i) => ({
                        day: i + 1,
                        passages: specs.map((spec, index) => ({
                            ...expandPassage(spec),
                            completedOn: records.get(passageKey(id, i + 1, index)),
                        })),
                    })),
                }
            })
            .sort((a, b) => String(a.added ?? '').localeCompare(String(b.added ?? '')))
    })

    const highlightColor = (verseId) => highlightMap.value.get(verseId)?.color ?? ''

    // { verseId: highlight | null }
    const setHighlights = (changes) => {
        records.set(Object.fromEntries(Object.entries(changes).map(([verseId, h]) => [`h:${verseId}`, h])))
    }

    const addHistory = (entry) => {
        records.set({ [historyKey(entry)]: entry })
    }

    // the details record for a plan, plus a record for each passage read
    const planRecords = (plan, completions = true) => {
        const id = planId(plan.id)
        const changes = {
            [`plan:${id}`]: {
                slug: plan.slug ?? null,
                title: plan.title,
                description: plan.description ?? '',
                attribution: plan.attribution ?? '',
                startDate: plan.startDate,
                added: plan.added ?? new Date().toISOString(),
                days: plan.days.map(day => day.passages.map(passageSpec)),
            },
        }
        if (completions) {
            plan.days.forEach((day, i) => day.passages.forEach((passage, index) => {
                if (passage.completedOn) {
                    changes[passageKey(id, i + 1, index)] = passage.completedOn
                }
            }))
        }
        return changes
    }

    const addPlan = (plan) => {
        records.set(planRecords(plan))
    }

    const deletePlan = (id) => {
        records.set({ [`plan:${id}`]: null })
    }

    // [{ day, index, completedOn }] for one plan
    const setPassagesCompleted = (id, passages) => {
        records.set(Object.fromEntries(passages.map(p => [passageKey(id, p.day, p.index), p.completedOn || null])))
    }

    // Imports take the formats the download buttons produce. 'merge' adds to
    // what is here; 'replace' deletes the rest, on every synced device.
    const importHistory = (entries, mode) => {
        const changes = {}
        if (mode === 'replace') {
            history.value.forEach(entry => changes[historyKey(entry)] = null)
        }
        ;(entries || []).filter(isHistoryEntry).forEach(entry => changes[historyKey(entry)] = entry)
        records.set(changes)
    }

    const importHighlights = (list, mode) => {
        const changes = {}
        if (mode === 'replace') {
            highlights.value.forEach(h => changes[h.verseId] = null)
        }
        // oldest first, so the newest copy of a verse wins
        ;[...(list || [])].filter(isHighlight)
            .sort((a, b) => String(a.timestamp ?? '').localeCompare(String(b.timestamp ?? '')))
            .forEach(h => changes[h.verseId] = h)
        setHighlights(changes)
    }

    const importPlans = (list, mode) => {
        const changes = {}
        if (mode === 'replace') {
            plans.value.forEach(plan => changes[`plan:${plan.id}`] = null)
        }
        const now = Date.now()
        normalizePlans((list || []).filter(isPlan)).forEach((plan, i) => {
            const id = planId(plan.id)
            const existing = plans.value.find(p => p.id === id)
            if (mode === 'replace' || !existing) {
                // older files have no added time; keep them in file order
                Object.assign(changes, planRecords({ added: new Date(now + i).toISOString(), ...plan }))
                return
            }
            // merging into a plan already here: keep its details, add any passages read
            plan.days.forEach((day, i) => day.passages.forEach((passage, index) => {
                if (passage.completedOn && !existing.days[i]?.passages[index]?.completedOn) {
                    changes[passageKey(id, i + 1, index)] = passage.completedOn
                }
            }))
        })
        records.set(changes)
    }

    return {
        highlights,
        history,
        plans,
        highlightColor,
        setHighlights,
        addHistory,
        addPlan,
        deletePlan,
        setPassagesCompleted,
        importHistory,
        importHighlights,
        importPlans,
    }
})

// Load records and keep this tab in step with the others. Data saved by older
// versions is moved into records once; the original is kept as a backup.
export const initUserData = () => {
    records.init(window.localStorage)
    window.addEventListener('storage', records.handleStorageEvent)

    const legacy = {}
    for (const [kind, key] of Object.entries(LEGACY_KEYS)) {
        const raw = localStorage.getItem(key)
        if (raw === null) {
            continue
        }
        try {
            legacy[kind] = { raw, value: JSON.parse(raw) }
        } catch (error) {
            // leave unreadable data where it is rather than lose it
            console.error(error)
        }
    }
    if (Object.keys(legacy).length === 0) {
        return
    }

    if (localStorage.getItem(LEGACY_BACKUP) === null) {
        localStorage.setItem(LEGACY_BACKUP, JSON.stringify({
            savedAt: new Date().toISOString(),
            ...Object.fromEntries(Object.entries(legacy).map(([kind, { raw }]) => [kind, raw])),
        }))
    }

    const userData = useUserDataStore()
    if (Array.isArray(legacy.highlights?.value)) userData.importHighlights(legacy.highlights.value, 'merge')
    if (Array.isArray(legacy.history?.value)) userData.importHistory(legacy.history.value, 'merge')
    if (Array.isArray(legacy.plans?.value)) userData.importPlans(legacy.plans.value, 'merge')

    Object.keys(legacy).forEach(kind => localStorage.removeItem(LEGACY_KEYS[kind]))
}
