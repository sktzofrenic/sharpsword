<template>
    <dd class="mt-2 text-base/7 text-slate-400 pt-2" v-if="sync.supported">
        <p class="text-slate-200">Sync &amp; backup</p>

        <template v-if="sync.enabled">
            <p>
                Plans, highlights and history are syncing with key
                <span class="font-mono text-slate-200 whitespace-nowrap">{{ maskedKey }}</span>
            </p>
            <p class="text-sm" :class="sync.status === 'error' ? 'text-red-200' : 'text-slate-500'">{{ statusText }}</p>

            <div class="bg-slate-900 p-3 my-2 rounded-lg" v-if="revealed">
                <p class="text-sm text-amber-200 mb-2" v-if="justCreated">
                    Save this key somewhere safe. It is the only way to get your data back on a new device, and anyone who has it can see and change your data.
                </p>
                <div class="flex items-center gap-2">
                    <span class="font-mono text-slate-100 break-words min-w-0 select-all grow">{{ sync.secret }}</span>
                    <button class="text-slate-100 hover:text-slate-200 px-3 py-1 rounded-lg bg-slate-700 shrink-0" @click="copyKey">
                        <i class="fa-regular fa-copy"></i> {{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
            </div>

            <div class="flex gap-2 mt-2">
                <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900 disabled:opacity-50"
                    :disabled="sync.status === 'syncing'"
                    @click="sync.syncNow"
                >
                    <i class="fa-solid fa-rotate" :class="{ 'fa-spin': sync.status === 'syncing' }"></i> Sync now
                </button>
                <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900" @click="toggleReveal">
                    <i class="fa-solid fa-key"></i> {{ revealed ? 'Hide key' : 'Show key' }}
                </button>
            </div>

            <div class="bg-slate-900 p-3 my-2 rounded-lg text-sm" v-if="confirmingDelete">
                <p class="text-slate-200">Delete the copy saved on the server?</p>
                <p class="mt-1">Your data stays on this device. Other devices still using this key will upload their copy again.</p>
                <div class="flex gap-4 items-center mt-2">
                    <button class="px-3 py-1 rounded-lg bg-red-900 text-red-100 hover:bg-red-800" @click="deleteCloudCopy">Delete</button>
                    <button class="text-slate-400 hover:text-slate-200" @click="confirmingDelete = false">Cancel</button>
                </div>
            </div>
            <div class="flex gap-4 mt-2 text-sm" v-else>
                <button class="text-slate-500 hover:text-slate-200 underline-offset-4 underline" @click="stopSyncing">
                    Stop syncing on this device
                </button>
                <button class="text-slate-500 hover:text-slate-200 underline-offset-4 underline" @click="confirmingDelete = true">
                    Delete cloud copy
                </button>
            </div>
        </template>

        <template v-else>
            <p>Back up your plans, highlights and history, and keep them in sync across your devices and browsers. No account needed, just a key.</p>

            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900 mt-2 disabled:opacity-50"
                v-if="!pending"
                :disabled="Boolean(busy)"
                @click="createKey"
            >
                <i class="fa-solid fa-key"></i> Create a sync key
            </button>

            <form class="mt-3" v-if="!pending" @submit.prevent="useKey">
                <label for="sync-key" class="text-sm">Already have a key?</label>
                <div class="flex gap-2 mt-1">
                    <input id="sync-key" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 font-mono"
                        placeholder="Your sync key"
                        v-model="keyInput"
                    >
                    <button type="submit" class="text-slate-100 hover:text-slate-200 px-4 py-1 rounded-lg bg-slate-900 shrink-0 disabled:opacity-50" :disabled="Boolean(busy) || !keyInput.trim()">
                        Use key
                    </button>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                    Any phrase of {{ MIN_KEY_LENGTH }}+ characters works, but anyone who guesses it can see your data. A created key can't be guessed.
                </p>
            </form>

            <p class="text-sm mt-2" v-if="busy">{{ busy }}</p>

            <div class="bg-slate-900 p-3 my-2 rounded-lg text-sm" v-if="pending && !pending.cloudHasData">
                <p class="text-slate-200">Nothing is saved under this key yet.</p>
                <p class="mt-1">Check it for typos, or start a new backup with it.</p>
                <div class="flex gap-4 items-center mt-2">
                    <button class="px-3 py-1 rounded-lg bg-slate-600 text-white hover:bg-slate-500" @click="connect('merge')">Start new backup</button>
                    <button class="text-slate-400 hover:text-slate-200" @click="pending = null">Cancel</button>
                </div>
            </div>

            <div class="bg-slate-900 p-3 my-2 rounded-lg text-sm" v-if="pending && pending.cloudHasData">
                <p class="text-slate-200">This key already has data saved.</p>
                <p class="mt-1">Combine it with what's on this device, or replace this device's plans, highlights and history with it?</p>
                <div class="flex flex-wrap gap-x-4 gap-y-2 items-center mt-2">
                    <button class="px-3 py-1 rounded-lg bg-slate-600 text-white hover:bg-slate-500" @click="connect('merge')">Combine</button>
                    <button class="px-3 py-1 rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600" @click="connect('cloud')">Replace this device's data</button>
                    <button class="text-slate-400 hover:text-slate-200" @click="pending = null">Cancel</button>
                </div>
            </div>
        </template>

        <div class="bg-slate-900 text-red-200 p-4 my-2 rounded-lg" v-if="message">
            {{ message }}
        </div>
    </dd>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSyncStore } from '@/stores/syncStore.js'
import { generateKey, MIN_KEY_LENGTH } from '@/assets/js/sync.js'
import { formatDate } from '@/assets/js/dateFormat.js'
import dayjs from 'dayjs'

const sync = useSyncStore()

const keyInput = ref('')
// what's happening while a key is checked, e.g. 'Checking key…'
const busy = ref('')
const message = ref('')
// a checked key waiting on the reader's choice
const pending = ref(null)
const revealed = ref(false)
const justCreated = ref(false)
const copied = ref(false)
const confirmingDelete = ref(false)

const maskedKey = computed(() => `•••••${sync.secret.slice(-5)}`)

const statusText = computed(() => {
    if (sync.status === 'syncing') {
        return 'Syncing…'
    }
    if (sync.status === 'offline') {
        return "You're offline. Changes will sync when you're back online."
    }
    if (sync.status === 'error') {
        return sync.error
    }
    if (!sync.lastSyncedAt) {
        return 'Waiting to sync…'
    }
    const at = dayjs(sync.lastSyncedAt)
    return `Last synced ${formatDate(at, at.isSame(dayjs(), 'day') ? 'LT' : 'lll')}`
})

const check = async (key) => {
    message.value = ''
    busy.value = 'Checking key…'
    try {
        return await sync.check(key)
    } catch (error) {
        console.error(error)
        message.value = error.isAxiosError
            ? "Couldn't reach the sync server. Check your connection and try again."
            : error.message
        return null
    } finally {
        busy.value = ''
    }
}

const connect = async (mode) => {
    const checked = pending.value
    pending.value = null
    keyInput.value = ''
    await sync.connect(checked, mode)
}

const createKey = async () => {
    const checked = await check(generateKey())
    if (!checked) {
        return
    }
    pending.value = checked
    await connect('merge')
    revealed.value = true
    justCreated.value = true
}

const useKey = async () => {
    const checked = await check(keyInput.value)
    if (!checked) {
        return
    }
    pending.value = checked
    // nothing to choose between when this device has no data yet
    if (checked.cloudHasData && !checked.deviceHasData) {
        await connect('merge')
    }
}

const toggleReveal = () => {
    revealed.value = !revealed.value
    justCreated.value = false
}

const copyKey = async () => {
    await navigator.clipboard.writeText(sync.secret)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

const stopSyncing = () => {
    sync.disconnect()
    revealed.value = false
}

const deleteCloudCopy = async () => {
    try {
        await sync.deleteCloudCopy()
        confirmingDelete.value = false
        revealed.value = false
    } catch (error) {
        console.error(error)
        message.value = "Couldn't delete the cloud copy. Check your connection and try again."
    }
}
</script>
