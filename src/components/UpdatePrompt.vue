<template>
    <Transition name="fade">
        <div class="fixed top-20 inset-x-0 z-20 flex justify-center px-4" v-if="needRefresh" role="status">
            <div class="flex items-center gap-3 rounded-2xl bg-slate-800 ring-1 ring-inset ring-slate-700 shadow-lg shadow-black px-4 py-3 text-sm text-slate-100">
                <span>A new version of SharpSword is available.</span>
                <button class="px-3 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white shrink-0" @click="updateServiceWorker()">
                    Reload
                </button>
                <button class="text-slate-400 hover:text-slate-200 shrink-0" @click="needRefresh = false">
                    Later
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

// an installed app can stay open for days, so look for new versions every hour
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
        if (registration) {
            setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL)
        }
    },
    onRegisterError(error) {
        console.error('Service worker registration failed', error)
    },
})
</script>

<style scoped>
</style>
