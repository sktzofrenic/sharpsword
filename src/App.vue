
<template>
    <div class="min-h-full">
        <nav class="bg-slate-950/30 sticky top-0 backdrop-blur-sm">
            <div class="mx-auto max-w-7xl pr-4">
                <div class="flex h-16 items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-16 w-16 border-r border-b border-slate-700 rounded-md" src="@/assets/sword_zoom_sq_512.png" alt="Your Company">
                        </div>
                    </div>
                    <div class="-mr-2 flex">
                        <!-- Mobile menu button -->
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-solid fa-text-size"></i>
                        </button>
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800" aria-controls="mobile-menu" aria-expanded="false">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-sharp-duotone fa-solid fa-book-bible mr-1"></i> KJV
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        <main>
            <div class="mx-auto max-w-7xl px-6 py-6 sm:px-6 lg:px-8 text-slate-100 pb-40">
                <div class="w-full flex flex-col justify-center items-center">
                    <div class="text-md font-semi-bold">Psalm</div>
                    <div class="font-bold text-6xl">30</div>
                </div>
                <div class="w-full italic px-4 my-6 flex justify-center text-lg">
                    A Psalm and Song at the dedication of the house of David.
                </div>
                <div class="flex flex-col justify-center leading-loose text-lg max-w-lg mx-auto">
                    <Verse v-for="verse in verses" :key="verse.n" :verse="verse" />
                </div>

            </div>
        </main>
        <footer class="bg-slate-950 fixed w-full bottom-0 border-slate-600 border-t">
            <div class="mx-auto max-w-7xl px-4 text-slate-200 flex items-center justify-center">
                <div class="flex justify-between w-full text-center bg-slate-900 my-2 rounded-2xl py-2">
                    <i class="fa-solid fa-left text-xl px-4 text-slate-500"></i>
                    <span class="font-bold py-1">Exodus 45</span>
                    <i class="fa-solid fa-right text-xl px-4 text-slate-500"></i>
                </div>
            </div>
            <div class="mx-auto max-w-7xl px-8 pb-2">
                <div class="flex h-16 items-center justify-between">
                    <div class="flex flex-col items-center text-slate-200 w-14 bg-slate-900 rounded-xl px-8 py-2">
                        <i class="fa-sharp-duotone fa-solid fa-book-bible text-xl block"></i>
                        <span class="text-xs">Bible</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14">
                        <i class="fa-sharp-duotone fa-solid fa-ballot-check text-xl block"></i>
                        <span class="text-xs">Plans</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14">
                        <i class="fa-solid fa-magnifying-glass text-xl block"></i>
                        <span class="text-xs">Search</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14">
                        <i class="fa-sharp-duotone fa-solid fa-highlighter-line text-xl block"></i>
                        <span class="text-xs">Highlights</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Verse from '@/components/Verse.vue'
import {onMounted, ref} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import http from '@/http'

const baseUrl = useBaseUrlStore()

const chapter = ref(1)
const book = ref('')
const verses = ref([])

const getVerses = async () => {
    try {
        var url = `${baseUrl.baseUrl}/api/v1/bible/kjv/1/30`
        const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv/1/30`)
        verses.value = response.data.v
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    console.log('mounted')
    getVerses()
})


</script>
<style scoped>
</style>
