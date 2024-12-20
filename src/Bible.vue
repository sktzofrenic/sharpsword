<template>
    <Transition name="fade">
        <Search @close="searchClosed" v-show="showSearch" @verseSelected="verseSelected" :visible="showSearch" />
    </Transition>
    <Transition name="fade">
        <VersePicker @close="versePickerClosed" @verseSelected="verseSelected" v-if="showVersePicker"/>
    </Transition>
    <Transition name="fade">
        <ReadingPlans :plans="plans" 
            @close="plansClosed" 
            @verseSelected="verseSelected" v-if="showPlans" 
            @completePassage="completePassage"
            @deletePlan="deletePlan"/>
    </Transition>
    <div class="min-h-full">
        <nav class="bg-slate-950/30 sticky top-0 backdrop-blur-sm">
            <div class="mx-auto max-w-7xl pr-4 relative">
                <Transition name="fade">
                    <ReadingSettings v-if="showReadingSettings" @close="showReadingSettings = false" />
                </Transition>
                <Transition name="fade">
                    <About 
                        @importData="importData"
                        v-if="showAbout" @close="showAbout = false" />
                </Transition>
                <Transition name="fade">
                    <History v-if="showHistory" @close="showHistory = false"
                        :history="history"
                        @verseSelected="verseSelected"
                    />
                </Transition>
                <Transition name="fade">
                    <Highlights v-if="showHighlights" @close="showHighlights = false"
                        :highlights="highlightedVerses"
                        @verseSelected="verseSelected"
                    />
                </Transition>
                <div class="flex h-16 items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-16 w-16 border-r border-b border-slate-700 rounded-md" src="@/assets/sword_zoom_sq_512.png" alt="Your Company">
                        </div>
                    </div>
                    <div class="-mr-2m flex">
                        <!-- Mobile menu button -->
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showHistory = !showHistory">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-sharp fa-solid fa-clock-rotate-left"></i>
                        </button>
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 mr-2" aria-controls="mobile-menu" aria-expanded="false" @click="showReadingSettings = !showReadingSettings">
                            <span class="absolute -inset-0.5"></span>
                            <i class="fa-solid fa-text-size"></i>
                        </button>
                        <button type="button" class="relative inline-flex items-center justify-center rounded-md bg-slate-800 py-1 px-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800" aria-controls="mobile-menu" aria-expanded="false" @click="displayAbout">
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
                    <div class="flex w-full gap-x-5 text-center bg-slate-900 my-2 rounded-2xl py-2 px-2">
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
                        <button class="px-2 text-gray-200 bg-slate-900 rounded-lg py-1" 
                            @click="richCopy">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>
            </Transition>
            <div class="flex flex-col mx-auto max-w-7xl px-4 text-slate-200 sm:flex-row sm:justify-between sm:gap-8">
                <div class="flex items-center justify-center sm:grow">
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
                <div class="flex h-16 mb-2 items-center justify-between sm:grow sm:mt-2">
                    <div class="flex flex-col items-center text-slate-200 w-14 bg-slate-900 rounded-xl px-8 py-2 cursor-pointer">
                        <i class="fa-sharp-duotone fa-solid fa-book-bible text-xl block"></i>
                        <span class="text-xs">Bible</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer" @click="showPlans = true">
                        <i class="fa-sharp-duotone fa-solid fa-ballot-check text-xl block"></i>
                        <span class="text-xs">Plans</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer" @click="showSearch = true" >
                        <i class="fa-solid fa-magnifying-glass text-xl block"></i>
                        <span class="text-xs">Search</span>
                    </div>
                    <div class="flex flex-col items-center text-slate-200 w-14 cursor-pointer" @click="showHighlights = true">
                        <i class="fa-sharp-duotone fa-solid fa-highlighter-line text-xl block"></i>
                        <span class="text-xs">Highlights</span>
                    </div>
                </div>
                <div class="hidden sm:flex sm:items-center sm:justify-center sm:grow">
                    <div class="flex justify-between w-full text-center bg-slate-900 my-2 rounded-2xl py-2">
                        <!-- input field for verse selection -->
                        <FuzzyFinder @verseSelected="verseSelected" />
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
import Highlights from '@/components/Highlights.vue'
import ReadingPlans from '@/components/ReadingPlans.vue'
import FuzzyFinder from '@/components/FuzzyFinder.vue'
import Search from '@/components/Search.vue'
import About from '@/components/About.vue'
import dayjs from 'dayjs'
import { onMounted, ref, computed, nextTick} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import { useAppStore } from '@/stores/appStore.js'
import http from '@/http'
import { mobileCheck } from '@/assets/js/mobileDetect.js'

const baseUrl = useBaseUrlStore()
const store = useAppStore()

const showReadingSettings = ref(false)
const showAbout = ref(false)
const showHistory = ref(false)
const showPlans = ref(false)
const showHighlights = ref(false)
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
const plans = ref([])
const history = ref([])
const lastLocation = ref({})

const prevChapter = ref({})
const nextChapter = ref({})
const reference = ref('')

// on left and right arrow key press, change chapter
window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeChapter(prevChapter.value)
    }
})
window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
        changeChapter(nextChapter.value)
    }
})



//computed sorted selected verses
const sortedSelectedVerses = computed(() => {
    return selectedVerses.value.sort((a, b) => a - b)
})

const completePassage = (data) => {
    var passage = data.passage
    var day = data.day
    var plan = data.plan
    // find plan and mark passage completedOn as today and then save in local storage
    const activePlan = plans.value.find(p => p.title === plan.title && p.startDate === plan.startDate)
    const activeDay = activePlan.days.find(d => d.day === day.day)
    activeDay.passages = activeDay.passages.map(p => {
        if (p.reference === passage.reference) {
            p.completedOn = new Date().toISOString()
        }
        return p
    })
    localStorage.setItem('plans', JSON.stringify(plans.value))
}

const importData = () => {
    // refresh hisotry and highlights from local storage
    highlightedVerses.value = JSON.parse(localStorage.getItem('highlightedVerses')) || []
    history.value = JSON.parse(localStorage.getItem('history')) || []
    plans.value = JSON.parse(localStorage.getItem('plans')) || []
}
// on Ctrl + C do a rich copy
window.addEventListener('keydown', function(e) {
    if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault()
        richCopy()
    }
})
//
// on Ctrl + C do a rich copy
window.addEventListener('keydown', function(e) {
    if (e.key === 'p' && e.ctrlKey) {
        e.preventDefault()
        richCopy({ plainText: true })
    }
})



const richCopy = (options) => {
    try {
        // get first and last verse from selection and build reference
        let firstVerse = verses.value.find(v => v.ID === sortedSelectedVerses.value[0])
        let lastVerse = verses.value.find(v => v.ID === sortedSelectedVerses.value[sortedSelectedVerses.value.length - 1])
        let firstVerseRef = `${firstVerse.B} ${firstVerse.C}:${parseInt(String(firstVerse.ID).slice(-3))}`
        let lastVerseRef = `${lastVerse.B} ${lastVerse.C}:${parseInt(String(lastVerse.ID).slice(-3))}`
        let trimmed = `${lastVerse.B === firstVerse.B ? '' : lastVerse.B} ${lastVerse.C === firstVerse.C ? '' : lastVerse.C + ':'}${parseInt(String(lastVerse.ID).slice(-3))}`

        let content = sortedSelectedVerses.value.map((verseId, index) => {
            let verse = verses.value.find(v => v.ID === verseId)

            let verseNumber = parseInt(String(verse.ID).slice(-3))

            if (sortedSelectedVerses.value.length === 1 || index === 0) {
                verseNumber = ``
            } else {
                verseNumber = `<b> v${verseNumber} </b>`
            }
            return `<span>${verseNumber} ${verse.T}</span>`

        }).join('')

        if (firstVerseRef === lastVerseRef) {
            content = `<span><b>${firstVerseRef} </b></span>` + content
        } else {
            content = `<span><b>${firstVerseRef}-${trimmed.trim()} </b></span>` + content
        }

        // remove span tag with label class including closing tag and content
        content = content.replace(/<span class="label">.*?<\/span>/gm, '')

        if ((options && options.plainText) || mobileCheck()) {

            // strip out all html tags from content
            content = content.replace(/<[^>]*>?/gm, '')
            navigator.clipboard.writeText(content)
            return
        }

        content += `<style>
            .add {
                font-style: italic;
            }
            .wj {
                color: #e17777;
            }
            </style>`
        const blobInput = new Blob([content], {type: 'text/html'});
        const clipboardItemInput = new ClipboardItem({'text/html' : blobInput});
        navigator.clipboard.write([clipboardItemInput]);
    } catch(e) {
        // Handle error with user feedback - "Copy failed!" kind of thing
        console.error(e)
    }
}


const updateLastLocation = () => {
    lastLocation.value = {
        bookId: bookId.value,
        book: book.value,
        chapter: chapter.value
    }
    // save last location to local storage
    localStorage.setItem('lastLocation', JSON.stringify(lastLocation.value))
}

const updateHistory = (verse) => {
    // check to see if same verse has been added in the last 5 minutes
    let lastVerse = history.value.find(v => v.bookId === parseInt(bookId.value) && v.chapter === chapter.value && v.verse === verse)
    if (lastVerse && dayjs().diff(dayjs(lastVerse.timestamp), 'minute') < 5) {
        return
    }

    history.value.unshift({
        bookId: parseInt(bookId.value),
        book: book.value,
        chapter: chapter.value,
        timestamp: new Date().toISOString(),
        verse: verse
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

        var verseData =  verses.value.find(v => v.ID === verseId)

        highlightedVerses.value.unshift({
            verseId: verseId,
            color: color,
            book: verseData.B,
            bookId: verseData.BID,
            timestamp: new Date().toISOString(),
            chapter: verseData.C,
            verse: parseInt(String(verseId).slice(-3)),
        })
    })
    selectedVerses.value = []
    // save highlighted verses to local storage
    localStorage.setItem('highlightedVerses', JSON.stringify(highlightedVerses.value))
}

const selectVerse = (verseId) => {
    // if holding shift key, select verses between last selected verse and current verse
    updateHistory(parseInt(String(verseId).slice(-3)))

    if (event.shiftKey && selectedVerses.value.length > 0) {
        let lastSelectedVerse = selectedVerses.value[selectedVerses.value.length - 1]
        let lastSelectedVerseIndex = verses.value.findIndex(v => v.ID === lastSelectedVerse)
        let currentVerseIndex = verses.value.findIndex(v => v.ID === verseId)
        let versesToSelect = verses.value.slice(Math.min(lastSelectedVerseIndex, currentVerseIndex), Math.max(lastSelectedVerseIndex, currentVerseIndex) + 1)
        selectedVerses.value = versesToSelect.map(v => v.ID)
        return
    }

    if (selectedVerses.value.includes(verseId)) {
        selectedVerses.value = selectedVerses.value.filter(v => v !== verseId)
    } else {
        selectedVerses.value.push(verseId)
    }
}

const displayAbout = () => {
    showAbout.value = true
    showVersePicker.value = false
    showSearch.value = false
    showHistory.value = false
    showHighlights.value = false
    showPlans.value = false
}

const verseSelected = (verse) => {
    bookId.value = verse.bookId
    book.value = verse.book
    chapter.value = verse.chapter
    var verseId = parseInt(`${verse.bookId}${String(verse.chapter).padStart(3, '0')}${String(verse.verse).padStart(3, '0')}`)
    getVerses(verseId)
    showVersePicker.value = false
    showSearch.value = false
    showHistory.value = false
    showHighlights.value = false
    showPlans.value = false
    updateHistory(verse.verse)
}

const searchClosed = () => {
    showSearch.value = false
}

const plansClosed = () => {
    showPlans.value = false
}

const deletePlan = (plan) => {
    plans.value = plans.value.filter(p => p.title !== plan.title && p.startDate !== plan.startDate)
    localStorage.setItem('plans', JSON.stringify(plans.value))
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

        if (!((response.data.v[0].BID === response.data.v[1].BID) && (response.data.v[0].C === response.data.v[1].C))) {
            response.data.v.shift()
        } 
        if (!((response.data.v[response.data.v.length - 1].BID === response.data.v[response.data.v.length - 2].BID) && (response.data.v[response.data.v.length - 1].C === response.data.v[response.data.v.length - 2].C))) {
            response.data.v.pop()
        }

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

    plans.value = JSON.parse(localStorage.getItem('plans')) || []

    if (lastLocation.value.bookId && lastLocation.value.chapter) {
        bookId.value = lastLocation.value.bookId
        chapter.value = lastLocation.value.chapter
    }

    getVerses()
})


</script>
<style scoped>
</style>
