<template>
        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showReadingSettings = !showReadingSettings">
            <span class="absolute -inset-0.5"></span>
            <i class="fa-solid fa-text-size"></i>
        </button>
        <Transition name="fade" mode="out-in">
            <div class="fixed z-10 top-20 left-8 w-screen" v-if="showReadingSettings">
                <div class="px-4 py-2 bg-slate-800 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-lg">
                    <h3 class="font-semibold text-slate-100">Reading Settings</h3>
                    <div class="text-slate-100">
                        <p>And here's some amazing content. It's very engaging. Right?</p>
                    </div>
                </div>
            </div>
        </Transition>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'

const store = useAppStore()

const showReadingSettings = ref(false)


</script>
