// Synced user data (highlights, history and reading plans) kept as small
// records that merge cleanly between tabs and devices.
//
// Each record is { v, t }: a value (null once deleted) and a hybrid logical
// clock stamp. Merging keeps whichever copy has the larger stamp, so applying
// the same changes in any order, any number of times, ends in the same state.
//
// Records are stored one per localStorage key, so two tabs writing different
// records never overwrite each other, and the `storage` event keeps every open
// tab in step without a server.
//
// Keys in use:
//   h:<verseId>                   a highlight
//   hist:<iso time>:<b>.<c>.<v>   a history entry, never changed once written
//   plan:<id>                     a reading plan's details and schedule
//   plan:<id>:<day>:<index>       when a plan passage was read

export const PREFIX = 'ss.r.'
export const HISTORY_LIMIT = 100

const STAMP = /^\d{15}\.\d{6}\.[a-z0-9]{8}$/

const records = new Map()
const listeners = new Set()
// tells this tab's edits apart from other tabs' made in the same millisecond
const node = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => (b % 36).toString(36)).join('')
let clock = { ms: 0, n: 0 }
let storage = null

const formatStamp = ({ ms, n }) => `${String(ms).padStart(15, '0')}.${String(n).padStart(6, '0')}.${node}`

const parseStamp = (t) => {
    const [ms, n] = t.split('.')
    return { ms: Number(ms), n: Number(n) }
}

// Keep the clock ahead of every stamp seen, so a device whose clock is behind
// still produces stamps newer than the changes it has already received.
const observe = (t) => {
    const seen = parseStamp(t)
    if (seen.ms > clock.ms || (seen.ms === clock.ms && seen.n > clock.n)) {
        clock = seen
    }
}

const tick = () => {
    const now = Date.now()
    if (now > clock.ms) {
        clock = { ms: now, n: 0 }
    } else if (clock.n < 999999) {
        clock = { ms: clock.ms, n: clock.n + 1 }
    } else {
        clock = { ms: clock.ms + 1, n: 0 }
    }
    return formatStamp(clock)
}

const isRecord = (record) => record && typeof record === 'object' && typeof record.t === 'string' && STAMP.test(record.t) && 'v' in record

const write = (key, record) => {
    try {
        storage?.setItem(PREFIX + key, JSON.stringify(record))
    } catch (error) {
        // out of space: keep the change in memory and in the cloud copy
        console.error(error)
    }
}

const remove = (key) => {
    records.delete(key)
    storage?.removeItem(PREFIX + key)
}

const notify = (change) => {
    listeners.forEach(listener => listener(change))
}

// Drop records every device would drop the same way, so they never return:
// history beyond the newest HISTORY_LIMIT entries, and the passages of deleted plans.
const compact = () => {
    const removed = []

    const historyKeys = [...records.keys()].filter(k => k.startsWith('hist:')).sort().reverse()
    let live = 0
    for (const key of historyKeys) {
        if (live >= HISTORY_LIMIT) {
            removed.push(key)
        } else if (records.get(key).v !== null) {
            live++
        }
    }

    for (const key of records.keys()) {
        const parts = key.split(':')
        if (parts[0] === 'plan' && parts.length > 2 && records.get(`plan:${parts[1]}`)?.v === null) {
            removed.push(key)
        }
    }

    removed.forEach(remove)
    return removed
}

// Load this browser's records. `store` is localStorage, or a stand-in for tests.
export const init = (store) => {
    storage = store
    records.clear()
    for (let i = 0; i < storage.length; i++) {
        const name = storage.key(i)
        if (!name?.startsWith(PREFIX)) {
            continue
        }
        try {
            const record = JSON.parse(storage.getItem(name))
            if (isRecord(record)) {
                records.set(name.slice(PREFIX.length), record)
                observe(record.t)
            }
        } catch {
            // ignore anything unreadable
        }
    }
    compact()
}

export const get = (key) => records.get(key)?.v ?? null

// [key, value] pairs of the live records whose keys start with prefix
export function* entries(prefix) {
    for (const [key, record] of records) {
        if (key.startsWith(prefix) && record.v !== null) {
            yield [key, record.v]
        }
    }
}

// Record changes made on this device: { key: value }, with null deleting.
export const set = (changes) => {
    const keys = Object.keys(changes)
    if (keys.length === 0) {
        return
    }
    for (const key of keys) {
        const record = { v: changes[key] ?? null, t: tick() }
        records.set(key, record)
        write(key, record)
    }
    const removed = compact()
    notify({ local: true, keys: [...keys, ...removed] })
}

// Merge records from the cloud copy. Returns the keys that changed here.
export const merge = (incoming) => {
    const changed = []
    for (const [key, record] of Object.entries(incoming || {})) {
        if (!isRecord(record)) {
            continue
        }
        observe(record.t)
        const current = records.get(key)
        if (!current || record.t > current.t) {
            records.set(key, record)
            write(key, record)
            changed.push(key)
        }
    }
    if (changed.length > 0) {
        changed.push(...compact())
        notify({ local: false, keys: changed })
    }
    return changed
}

// Whether this device has anything the given copy is missing or has older.
export const hasNewerThan = (other) => {
    for (const [key, record] of records) {
        const theirs = other?.[key]
        if (!theirs || record.t > theirs.t) {
            return true
        }
    }
    return false
}

export const snapshot = () => Object.fromEntries(records)

export const isEmpty = () => [...records.values()].every(r => r.v === null)

// Forget every record on this device, e.g. before taking the cloud copy instead.
export const clear = () => {
    const keys = [...records.keys()]
    keys.forEach(remove)
    notify({ local: false, keys })
}

export const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

// Apply another tab's write, delivered by the window `storage` event.
export const handleStorageEvent = (event) => {
    if (event.storageArea !== storage || !event.key?.startsWith(PREFIX)) {
        return
    }
    const key = event.key.slice(PREFIX.length)
    if (event.newValue === null) {
        // another tab compacted or cleared it
        if (records.delete(key)) {
            notify({ local: false, keys: [key] })
        }
        return
    }
    let record
    try {
        record = JSON.parse(event.newValue)
    } catch {
        return
    }
    if (!isRecord(record)) {
        return
    }
    observe(record.t)
    const current = records.get(key)
    if (current && current.t > record.t) {
        // two tabs wrote at once and the older write landed last; put ours back
        write(key, current)
        return
    }
    if (!current || record.t !== current.t) {
        records.set(key, record)
        const removed = compact()
        notify({ local: false, keys: [key, ...removed] })
    }
}
