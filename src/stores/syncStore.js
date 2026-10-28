import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as records from '@/assets/js/records.js'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import {
    MIN_KEY_LENGTH,
    canSync,
    decrypt,
    deleteVault,
    deriveKeys,
    encrypt,
    fetchVault,
    importKey,
    normalizeKey,
    putVault,
} from '@/assets/js/sync.js'

// Anonymous backup and sync. This device's records are the working copy; the
// server keeps an encrypted snapshot. A sync pulls the snapshot if it changed,
// merges it in, and uploads the merged copy if this device had anything newer.
// Shared by every tab of this browser through localStorage, and serialized
// with a Web Lock so only one tab talks to the server at a time.

// { secret, vault, key, version } while syncing is on
const CONFIG = 'ss.sync'
// changes whenever this browser's data changes; PUSHED is its value at the last upload
const EDITED = 'ss.sync.edited'
const PUSHED = 'ss.sync.pushed'
const SYNCED_AT = 'ss.sync.at'

const PUSH_DELAY = 2000
const POLL_INTERVAL = 60000
// a run that conflicts this many times in a row is retried on the next one
const MAX_ATTEMPTS = 5

const readConfig = () => {
    try {
        return JSON.parse(localStorage.getItem(CONFIG))
    } catch {
        return null
    }
}

const writeConfig = (config) => localStorage.setItem(CONFIG, JSON.stringify(config))

const isDirty = () => localStorage.getItem(EDITED) !== localStorage.getItem(PUSHED)

const markPushed = (edited) => {
    if (edited === null) {
        localStorage.removeItem(PUSHED)
    } else {
        localStorage.setItem(PUSHED, edited)
    }
}

// no response at all means the network, not the server
const isOffline = (error) => error.isAxiosError && !error.response

const withLock = (task) => navigator.locks ? navigator.locks.request('sharpsword-sync', task) : task()

const cryptoKeys = new Map()
const cryptoKeyFor = (key) => {
    if (!cryptoKeys.has(key)) {
        cryptoKeys.set(key, importKey(key))
    }
    return cryptoKeys.get(key)
}

const errorMessage = (error) => {
    if (!error.response) {
        return error.name === 'OperationError'
            ? "Couldn't read the cloud copy with this key."
            : error.message
    }
    if (error.response.status === 413) {
        return 'Your data is too large to sync.'
    }
    if (error.response.status === 429) {
        return 'Syncing too often. Trying again shortly.'
    }
    return 'The sync server had a problem. Trying again shortly.'
}

export const useSyncStore = defineStore('sync', () => {
    const baseUrl = useBaseUrlStore()

    const config = ref(readConfig())
    // 'idle' | 'syncing' | 'offline' | 'error'
    const status = ref('idle')
    const error = ref('')
    const lastSyncedAt = ref(localStorage.getItem(SYNCED_AT))
    const supported = canSync()

    const enabled = computed(() => Boolean(config.value))
    const secret = computed(() => config.value?.secret ?? '')

    let pushTimer = null
    let running = null
    let runAgain = false
    let lastRunAt = 0

    // Pull, merge and push until the server has everything this device has.
    const run = () => withLock(async () => {
        const current = readConfig()
        config.value = current
        if (!current) {
            return
        }
        if (!navigator.onLine) {
            status.value = 'offline'
            return
        }

        status.value = 'syncing'
        try {
            const cryptoKey = await cryptoKeyFor(current.key)
            const edited = localStorage.getItem(EDITED)
            let remote = await fetchVault(baseUrl.baseUrl, current.vault, current.version)
            let mustPush = isDirty()

            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                if (remote.data) {
                    const snapshot = await decrypt(remote.data, cryptoKey)
                    records.merge(snapshot.records)
                    mustPush ||= records.hasNewerThan(snapshot.records)
                } else if (remote.version === 0) {
                    // nothing in the cloud yet, or it was deleted
                    mustPush = true
                }
                current.version = remote.version
                writeConfig(current)

                if (!mustPush) {
                    break
                }
                const data = await encrypt({ records: records.snapshot() }, cryptoKey)
                const result = await putVault(baseUrl.baseUrl, current.vault, remote.version, data)
                if (result.saved) {
                    current.version = result.version
                    writeConfig(current)
                    markPushed(edited)
                    break
                }
                // another device saved first: merge theirs and try again
                remote = result
            }

            lastSyncedAt.value = new Date().toISOString()
            localStorage.setItem(SYNCED_AT, lastSyncedAt.value)
            status.value = 'idle'
            error.value = ''
            if (isDirty()) {
                // changed while uploading, or still conflicting
                schedulePush()
            }
        } catch (e) {
            console.error(e)
            status.value = isOffline(e) ? 'offline' : 'error'
            error.value = status.value === 'error' ? errorMessage(e) : ''
        }
    })

    // One run at a time per tab; a request made mid-run starts one more after it.
    const syncNow = async () => {
        if (!readConfig()) {
            return
        }
        if (running) {
            runAgain = true
            return running
        }
        clearTimeout(pushTimer)
        running = run()
        try {
            await running
        } finally {
            running = null
            lastRunAt = Date.now()
            if (runAgain) {
                runAgain = false
                syncNow()
            }
        }
    }

    // focus and visibility often fire together; one check is enough
    const syncIfStale = () => {
        if (isDirty() || Date.now() - lastRunAt > 5000) {
            syncNow()
        }
    }

    const schedulePush = () => {
        clearTimeout(pushTimer)
        pushTimer = setTimeout(syncNow, PUSH_DELAY)
    }

    // called for every change made in this tab
    const noteLocalChange = () => {
        localStorage.setItem(EDITED, crypto.randomUUID?.() ?? String(Math.random()))
        if (config.value) {
            schedulePush()
        }
    }

    // Look up a key before turning sync on. Returns what the UI needs to ask
    // about: whether the key already has data, and whether this device does.
    const check = async (input) => {
        const key = normalizeKey(input)
        if (key.length < MIN_KEY_LENGTH) {
            throw new Error(`Use at least ${MIN_KEY_LENGTH} characters.`)
        }
        const derived = await deriveKeys(key)
        const remote = await fetchVault(baseUrl.baseUrl, derived.vault)
        return {
            secret: key,
            ...derived,
            cloudHasData: remote.version > 0,
            deviceHasData: !records.isEmpty(),
        }
    }

    // Turn sync on with a checked key. 'merge' combines this device's data with
    // the cloud copy; 'cloud' replaces this device's data with it.
    const connect = async ({ secret, vault, key }, mode = 'merge') => {
        if (mode === 'cloud') {
            records.clear()
        }
        writeConfig({ secret, vault, key, version: 0 })
        config.value = readConfig()
        status.value = 'idle'
        error.value = ''
        await syncNow()
    }

    // Stop syncing on this device. Its data stays here.
    const disconnect = () => {
        clearTimeout(pushTimer)
        localStorage.removeItem(CONFIG)
        localStorage.removeItem(PUSHED)
        localStorage.removeItem(SYNCED_AT)
        config.value = null
        lastSyncedAt.value = null
        status.value = 'idle'
        error.value = ''
    }

    const deleteCloudCopy = async () => {
        const current = readConfig()
        if (current) {
            await deleteVault(baseUrl.baseUrl, current.vault)
        }
        disconnect()
    }

    // Start syncing in the background: soon after changes, when the app comes
    // back into view or online, and every minute while it is on screen.
    const start = () => {
        if (!supported) {
            return
        }
        records.subscribe(({ local }) => {
            if (local) {
                noteLocalChange()
            }
        })
        window.addEventListener('online', syncNow)
        window.addEventListener('focus', syncIfStale)
        document.addEventListener('visibilitychange', () => {
            // on hide, send anything waiting before the page may be frozen
            if (document.visibilityState === 'visible') {
                syncIfStale()
            } else if (isDirty()) {
                syncNow()
            }
        })
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                syncNow()
            }
        }, POLL_INTERVAL)
        // another tab turned sync on or off, or finished a sync
        window.addEventListener('storage', (event) => {
            if (event.key === CONFIG) {
                config.value = readConfig()
            } else if (event.key === SYNCED_AT) {
                lastSyncedAt.value = event.newValue
            }
        })
        syncNow()
    }

    return {
        supported,
        enabled,
        secret,
        status,
        error,
        lastSyncedAt,
        start,
        syncNow,
        check,
        connect,
        disconnect,
        deleteCloudCopy,
    }
})
