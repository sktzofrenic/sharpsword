
<template>
    <Transition name="fade">
        <Search @close="searchClosed" v-if="showSearch" />
    </Transition>
    <Transition name="fade">
        <VersePicker @close="versePickerClosed" @verse="verse" v-if="showVersePicker"/>
    </Transition>
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
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showSearch = true">
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
            <div  class="mx-auto max-w-7xl px-6  text-slate-100 pb-40 -mt-10 pt-20" style="height: 100vh; overflow-y: auto" ref="versesContainer">
                <div class="w-full flex flex-col justify-center items-center">
                    <div class="text-md font-semi-bold">
                        {{ book }}
                    </div>
                    <div class="font-bold text-6xl mb-8">
                        {{ chapter }}
                    </div>
                </div>
                <div class="flex flex-col justify-center leading-loose text-lg max-w-lg mx-auto" >
                    <Verse v-for="(verse, index) in verses" :key="verse.verse_id" :verse="verse" :index=index />
                    <div class="flex justify-center mb-24 mt-8">
                        <button class="text-slate-600 italic text-sm">
                            KJV text in the public domain.
                        </button>
                    </div>
                </div>

            </div>
        </main>
        <footer class="bg-slate-950 fixed w-full bottom-0 border-slate-600 border-t">
            <div class="mx-auto max-w-7xl px-4 text-slate-200 flex items-center justify-center">
                <div class="flex justify-between w-full text-center bg-slate-900 my-2 rounded-2xl py-2">
                    <span class="cursor-pointer" @click="changeChapter(prevChapter)">
                        <i class="fa-solid fa-left text-xl px-4 text-slate-500"></i>
                    </span>
                    <span class="font-bold py-1 w-1/2 cursor-pointer" @click="showVersePicker = true">
                        {{ book }} {{ chapter }}
                    </span>
                    <span class="cursor-pointer" @click="changeChapter(nextChapter)">
                        <i class="fa-solid fa-right text-xl px-4 text-slate-500"></i>
                    </span>
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
                    <div class="flex flex-col items-center text-slate-200 w-14" @click="showSearch = true">
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
import Verse from '@/components/Verse.vue'
import VersePicker from '@/components/VersePicker.vue'
import Search from '@/components/Search.vue'
import { onMounted, ref, computed } from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import http from '@/http'

const baseUrl = useBaseUrlStore()

const chapter = ref(1)
const book = ref('')
const bookId = ref(1)
const verses = ref([])
const versesContainer = ref(null)
const showVersePicker = ref(false)
const showSearch = ref(false)

const prevChapter = ref({})
const nextChapter = ref({})

const verse = (verse) => {
    showVersePicker.value = false
}

const searchClosed = () => {
    showSearch.value = false
}

const versePickerClosed = () => {
    showVersePicker.value = false
}

const changeChapter = (reference) => {
    bookId.value = reference.bookId
    chapter.value = reference.chapter
    getVerses()
}

const getVerses = async () => {
    try {
        const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv/${bookId.value}/${chapter.value}`)
        if (response.data.v === null || response.data.v.length === 0) {
            return
        }

        var prev = response.data.v[0]
        prevChapter.value = {
            bookId: prev.BID,
            chapter: prev.C
        }
        var next = response.data.v[response.data.v.length - 1]
        nextChapter.value = {
            bookId: next.BID,
            chapter: next.C
        }

        response.data.v.shift()
        response.data.v.pop()

        verses.value = response.data.v
        bookId.value = response.data.v[0].BID
        book.value = response.data.v[0].B
        chapter.value = response.data.v[0].C
        // scroll to top of verses container
        versesContainer.value.scrollTop = 0

    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    getVerses()
})


</script>
<style scoped>
</style>
