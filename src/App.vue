
<template>
    <Transition name="fade">
        <Search @close="searchClosed" v-show="showSearch" @verseSelected="verseSelected" />
    </Transition>
    <Transition name="fade">
        <VersePicker @close="versePickerClosed" @verseSelected="verseSelected" v-if="showVersePicker"/>
    </Transition>
    <div class="min-h-full">
        <nav class="bg-slate-950/30 sticky top-0 backdrop-blur-sm">
            <div class="mx-auto max-w-7xl pr-4 relative">
                <Transition name="fade">
                    <ReadingSettings v-if="showReadingSettings" @close="showReadingSettings = false" />
                </Transition>
                <Transition name="fade">
                    <History v-if="showHistory" @close="showHistory = false"
                        :history="history"
                        @changeChapter="changeChapter"
                    />
                </Transition>
                <div class="flex h-16 items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-16 w-16 border-r border-b border-slate-700 rounded-md" src="@/assets/sword_zoom_sq_512.png" alt="Your Company">
                        </div>
                    </div>
                    <div class="-mr-2 flex">
                        <!-- Mobile menu button -->
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showHistory = !showHistory">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-sharp fa-solid fa-clock-rotate-left"></i>
                        </button>
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showReadingSettings = !showReadingSettings">
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
                <div class="flex flex-col justify-center leading-loose text-lg max-w-lg mx-auto">
                    <Verse v-for="(verse, index) in verses" 
                        @selectVerse="selectVerse"
                        :key="verse.verse_id" 
                        :fontSize="store.fontSize"
                        :lineHeight="store.lineHeight"
                        :selected="selectedVerses.includes(verse.ID)"
                        :presented="presentedVerses.includes(verse.ID)"
                        :highlighted="findHighlightedVerse(verse.ID)"
                        :verse="verse" 
                        :index=index />
                    <div class="flex justify-center mb-24 mt-8">
                        <button class="text-slate-600 italic text-sm">
                            KJV text in the public domain.
                        </button>
                    </div>
                </div>

            </div>
        </main>
        <footer class="bg-slate-950 fixed w-full bottom-0 border-slate-600 border-t">
            <Transition name="slide-fade" mode="out-in">
                <div class="mx-auto max-w-7xl px-4 text-slate-200 flex items-center justify-center" v-if="selectedVerses.length > 0">
                    <div class="flex w-full gap-x-6 text-center bg-slate-900 my-2 rounded-2xl py-2 px-2">
                        <!-- deselect all verses -->
                        <button class="px-2 text-slate-200 bg-slate-900 rounded-lg py-1"  
                            @click="highlightSelectedVerses('')">
                            <i class="fa-regular fa-ban"></i>
                        </button>
                        <!-- highlite selected verses -->
                        <button class="px-2 text-yellow-200 bg-yellow-900 rounded-lg py-1" 
                            @click="highlightSelectedVerses('yellow')">
                            <i class="fa-solid fa-highlighter-line"></i>
                        </button>
                        <button class="px-2 text-red-200 bg-red-900 rounded-lg py-1" 
                            @click="highlightSelectedVerses('red')">
                            <i class="fa-solid fa-highlighter-line"></i>
                        </button>
                        <button class="px-2 text-blue-200 bg-blue-900 rounded-lg py-1" 
                            @click="highlightSelectedVerses('blue')">
                            <i class="fa-solid fa-highlighter-line"></i>
                        </button>
                        <button class="px-2 text-lime-200 bg-lime-900 rounded-lg py-1" 
                            @click="highlightSelectedVerses('lime')">
                            <i class="fa-solid fa-highlighter-line"></i>
                        </button>
                        <button class="px-2 text-violet-200 bg-violet-900 rounded-lg py-1" 
                            @click="highlightSelectedVerses('violet')">
                            <i class="fa-solid fa-highlighter-line"></i>
                        </button>
                    </div>
                </div>
            </Transition>
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
                    <div class="flex flex-col items-center text-slate-200 w-14 bg-slate-900 rounded-xl px-8 py-2 cursor-pointer">
                        <i class="fa-sharp-duotone fa-solid fa-book-bible text-xl block"></i>
                        <span class="text-xs">Bible</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer">
                        <i class="fa-sharp-duotone fa-solid fa-ballot-check text-xl block"></i>
                        <span class="text-xs">Plans</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer" @click="showSearch = true" >
                        <i class="fa-solid fa-magnifying-glass text-xl block"></i>
                        <span class="text-xs">Search</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer">
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
import ReadingSettings from '@/components/ReadingSettings.vue'
import History from '@/components/History.vue'
import Search from '@/components/Search.vue'
import { onMounted, ref, computed, nextTick} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import { useAppStore } from '@/stores/appStore.js'
import http from '@/http'

const baseUrl = useBaseUrlStore()
const store = useAppStore()

const showReadingSettings = ref(false)
const showHistory = ref(false)
const chapter = ref(1)
const book = ref('')
const bookId = ref(1)
const verses = ref([])
const versesContainer = ref(null)
const showVersePicker = ref(false)
const showSearch = ref(false)
const presentedVerses = ref([])
const selectedVerses = ref([])
const highlightedVerses = ref([])
const history = ref([])
const lastLocation = ref({})

const prevChapter = ref({})
const nextChapter = ref({})


const updateLastLocation = () => {
    lastLocation.value = {
        bookId: bookId.value,
        book: book.value,
        chapter: chapter.value
    }
    // save last location to local storage
    localStorage.setItem('lastLocation', JSON.stringify(lastLocation.value))
}

const updateHistory = () => {
    if (history.value.length > 0 && history.value[0].bookId === bookId.value && history.value[0].chapter === chapter.value) {
        return
    }
    history.value.unshift({
        bookId: bookId.value,
        book: book.value,
        chapter: chapter.value
    })
    // save history to local storage
    localStorage.setItem('history', JSON.stringify(history.value.slice(0, 100)))
}

const findHighlightedVerse = (verseId) => {
    let highlight = highlightedVerses.value.find(v => v.verseId === verseId)
    return highlight ? highlight.color : ''
}

const highlightSelectedVerses = (color) => {
    if (!color) {
        highlightedVerses.value = highlightedVerses.value.filter(v => !selectedVerses.value.includes(v.verseId))
        selectedVerses.value = []
        return
    }
    selectedVerses.value.forEach(verseId => {
        highlightedVerses.value = highlightedVerses.value.filter(v => v.verseId !== verseId)

        highlightedVerses.value.push({
            verseId: verseId,
            color: color
        })
    })
    selectedVerses.value = []
    // save highlighted verses to local storage
    localStorage.setItem('highlightedVerses', JSON.stringify(highlightedVerses.value))
}

const selectVerse = (verseId) => {
    if (selectedVerses.value.includes(verseId)) {
        selectedVerses.value = selectedVerses.value.filter(v => v !== verseId)
    } else {
        selectedVerses.value.push(verseId)
    }
}

const verseSelected = (verse) => {
    bookId.value = verse.bookId
    book.value = verse.book
    chapter.value = verse.chapter
    getVerses(parseInt(`${verse.bookId}${String(verse.chapter).padStart(3, '0')}${String(verse.verse).padStart(3, '0')}`))
    showVersePicker.value = false
    showSearch.value = false
    updateHistory()
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
    showHistory.value = false
}

const scrollToVerse = (verseId) => {
    const verse = document.getElementById(verseId)
    if (verse) {
        verse.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
}

const getVerses = async (verseId) => {
    presentedVerses.value = []
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
        updateLastLocation({
            book: book.value,
            bookId: bookId.value,
            chapter: chapter.value
        })
        if (verseId) {
            // wait for vue nexttick
            await nextTick()

            scrollToVerse(verseId)
            presentedVerses.value.push(verseId)
        }
        selectedVerses.value = []
        showHistory.value = false
        showReadingSettings.value = false
        setTimeout(() => {
            presentedVerses.value = []
        }, 5000)

    } catch (error) {
        console.error(error)
    }
}

onMounted(async () => {
    // get highlighted verses from local storage
    highlightedVerses.value = JSON.parse(localStorage.getItem('highlightedVerses')) || []
    // get history from local storage
    history.value = JSON.parse(localStorage.getItem('history')) || []
    // get last location from local storage
    lastLocation.value = JSON.parse(localStorage.getItem('lastLocation')) || {}

    if (lastLocation.value.bookId && lastLocation.value.chapter) {
        bookId.value = lastLocation.value.bookId
        chapter.value = lastLocation.value.chapter
    }

    getVerses()
})


</script>
<style scoped>
</style>
