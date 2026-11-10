<template>
    <UpdatePrompt />
    <Transition name="fade">
        <div class="fixed top-20 inset-x-0 z-20 flex justify-center px-4 pointer-events-none" v-if="loadError" role="alert">
            <div class="rounded-2xl bg-slate-800 ring-1 ring-inset ring-slate-700 shadow-lg shadow-black px-4 py-3 text-sm text-slate-100">
                {{ loadError }}
            </div>
        </div>
    </Transition>
    <Transition name="fade">
        <Search @close="searchClosed" v-show="showSearch" @verseSelected="verseSelected" :visible="showSearch" />
    </Transition>
    <Transition name="fade">
        <VersePicker @close="versePickerClosed" @verseSelected="verseSelected" v-if="showVersePicker"/>
    </Transition>
    <Transition name="fade">
        <ReadingPlans :plans="plans"
            :focus="readingPlanContext"
            @close="plansClosed"
            v-if="showPlans"
            @startPlan="startPlan"
            @togglePassage="togglePassage"
            @setDayComplete="setDayComplete"
            @openPassage="openPassage"
            @deletePlan="deletePlan"/>
    </Transition>
    <div class="min-h-full">
        <!-- z-[1] keeps the bar above verses (positioned for their glow) but below z-10 modals -->
        <nav class="bg-slate-950/30 sticky top-0 z-[1] backdrop-blur-sm">
            <div class="mx-auto max-w-7xl pr-4 relative">
                <Transition name="fade">
                    <ReadingSettings v-if="showReadingSettings" @close="showReadingSettings = false" />
                </Transition>
                <Transition name="fade">
                    <About v-if="showAbout" @close="showAbout = false" />
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
            <!-- overflow-x-hidden: nothing here should ever scroll sideways, e.g. the verse glow on phones -->
            <!-- touch-action: the browser keeps vertical scrolling and pinch zoom, horizontal swipes change chapter -->
            <div  class="mx-auto max-w-7xl px-6  text-slate-100 -mt-10 pt-20 overflow-x-hidden" :class="planReading ? 'pb-56' : 'pb-40'" style="height: 100vh; overflow-y: auto; touch-action: pan-y pinch-zoom" ref="versesContainer"
                @touchstart.passive="onSwipeStart"
                @touchmove="onSwipeMove"
                @touchend="onSwipeEnd"
                @touchcancel="onSwipeCancel">
              <div class="relative" :style="swipeStyle">
                <!-- the chapter being swiped to, one screen width to the side, level with the top of the screen -->
                <div v-if="swipePreview" class="absolute overflow-hidden pointer-events-none" aria-hidden="true"
                    :style="{ top: `${swipePreview.top}px`, left: `${swipePreview.left}px`, right: `${-swipePreview.left}px`, height: '100vh' }">
                    <div class="w-full flex flex-col justify-center items-center">
                        <div class="text-md font-semi-bold">
                            {{ swipePreview.book }}
                        </div>
                        <div class="font-bold text-6xl mb-8">
                            {{ swipePreview.chapter }}
                        </div>
                    </div>
                    <div class="flex flex-col justify-center leading-loose text-lg max-w-lg mx-auto">
                        <Verse v-for="(verse, index) in swipePreview.verses"
                            :key="verse.ID"
                            :fontSize="store.fontSize"
                            :lineHeight="store.lineHeight"
                            :highlighted="findHighlightedVerse(verse.ID)"
                            :verse="verse"
                            :index=index />
                    </div>
                </div>
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
            <div class="mx-auto max-w-7xl px-4 text-slate-200" v-if="planReading">
                <div class="flex items-center gap-2 bg-slate-900 mt-2 rounded-2xl py-2 px-3 text-sm">
                    <button class="text-slate-400 hover:text-slate-200 text-left grow truncate" @click="showPlans = true">
                        <span class="font-semibold text-slate-200">{{ planReading.plan.title }}</span>
                        · Day {{ planReading.day.day }}
                        <span v-if="planReading.passage"> · {{ planReading.passage.reference }}</span>
                    </button>
                    <button class="px-3 py-1 rounded-lg shrink-0"
                        v-if="planReading.passage"
                        :class="planReading.passage.completedOn ? 'bg-slate-700 text-slate-200' : 'bg-slate-600 text-white hover:bg-slate-500'"
                        @click="toggleCurrentPlanPassage"
                    >
                        <i class="fa-solid fa-circle-check" v-if="planReading.passage.completedOn"></i>
                        <i class="fa-regular fa-circle" v-else></i>
                        Read
                    </button>
                    <button class="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 truncate max-w-[40%]"
                        v-if="planReading.next"
                        @click="goToNextPlanPassage"
                    >
                        {{ planReading.passage ? 'Next' : 'Continue' }}: {{ planReading.next.reference }}
                        <i class="fa-solid fa-right ml-1"></i>
                    </button>
                    <button class="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 shrink-0"
                        v-else-if="planReading.passage"
                        @click="finishPlanDay"
                    >
                        Done
                    </button>
                    <button class="text-slate-500 hover:text-slate-200 px-1 shrink-0" @click="readingPlanContext = null" aria-label="Hide reading plan bar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
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
import UpdatePrompt from '@/components/UpdatePrompt.vue'
import dayjs from 'dayjs'
import { onMounted, ref, computed, nextTick} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import { useAppStore } from '@/stores/appStore.js'
import { useUserDataStore } from '@/stores/userDataStore.js'
import http from '@/http'
import { mobileCheck } from '@/assets/js/mobileDetect.js'
import { passageLocation } from '@/assets/js/plans.js'
import { BOOKS_BY_ID } from '@/assets/js/books.js'

const baseUrl = useBaseUrlStore()
const store = useAppStore()
const userData = useUserDataStore()

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
const highlightedVerses = computed(() => userData.highlights)
const plans = computed(() => userData.plans)
// { planId, day } of the plan day being read, set when a passage is opened from Plans
const readingPlanContext = ref(null)
const history = computed(() => userData.history)
const lastLocation = ref({})

const prevChapter = ref({})
const nextChapter = ref({})
const reference = ref('')
const loadError = ref('')
let loadErrorTimer = null

const showLoadError = (message) => {
    loadError.value = message
    clearTimeout(loadErrorTimer)
    loadErrorTimer = setTimeout(() => {
        loadError.value = ''
    }, 4000)
}

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

const findPlanDay = (planId, day) => {
    return plans.value.find(p => p.id === planId)?.days.find(d => d.day === day)
}

const startPlan = (plan) => {
    userData.addPlan(plan)
}

const togglePassage = ({ planId, day, index }) => {
    const passage = findPlanDay(planId, day)?.passages[index]
    if (!passage) {
        return
    }
    userData.setPassagesCompleted(planId, [{ day, index, completedOn: passage.completedOn ? null : new Date().toISOString() }])
}

const setDayComplete = ({ planId, day, complete }) => {
    const passages = findPlanDay(planId, day)?.passages ?? []
    userData.setPassagesCompleted(planId, passages
        // leave already-read passages with the day they were read
        .map((p, index) => ({ day, index, completedOn: complete ? (p.completedOn || new Date().toISOString()) : null }))
        .filter((p, index) => p.completedOn !== passages[index].completedOn))
}

const markCurrentPlanPassageRead = () => {
    const { plan, day, index, passage } = planReading.value
    if (passage && !passage.completedOn) {
        userData.setPassagesCompleted(plan.id, [{ day: day.day, index, completedOn: new Date().toISOString() }])
    }
}

const goToPassage = (passage) => {
    const location = passageLocation(passage)
    if (location.wholeChapter) {
        changeChapter(location)
        showPlans.value = false
        updateHistory(1)
    } else {
        verseSelected(location)
    }
}

const openPassage = ({ planId, day, index }) => {
    const passage = findPlanDay(planId, day)?.passages[index]
    if (!passage) {
        return
    }
    readingPlanContext.value = { planId, day }
    goToPassage(passage)
}

// The plan day being read, and where the open chapter sits in it
const planReading = computed(() => {
    if (!readingPlanContext.value) {
        return null
    }
    const plan = plans.value.find(p => p.id === readingPlanContext.value.planId)
    const day = plan?.days.find(d => d.day === readingPlanContext.value.day)
    if (!day) {
        return null
    }
    const index = day.passages.findIndex(p => {
        const location = passageLocation(p)
        return location.bookId === Number(bookId.value) && location.chapter === Number(chapter.value)
    })
    return {
        plan,
        day,
        index,
        passage: day.passages[index] || null,
        // after the open passage, or the first unread one if the reader wandered off
        next: index >= 0 ? day.passages[index + 1] || null : day.passages.find(p => !p.completedOn) || null,
    }
})

const toggleCurrentPlanPassage = () => {
    const { plan, day, index } = planReading.value
    togglePassage({ planId: plan.id, day: day.day, index })
}

const goToNextPlanPassage = () => {
    const { next } = planReading.value
    markCurrentPlanPassageRead()
    goToPassage(next)
}

const finishPlanDay = () => {
    markCurrentPlanPassageRead()
    showPlans.value = true
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

    userData.addHistory({
        bookId: parseInt(bookId.value),
        book: book.value,
        chapter: chapter.value,
        timestamp: new Date().toISOString(),
        verse: verse
    })
}

const findHighlightedVerse = (verseId) => userData.highlightColor(verseId)

const highlightSelectedVerses = (color) => {
    const changes = {}
    selectedVerses.value.forEach(verseId => {
        if (!color) {
            // only clear highlights that exist, so nothing is written for plain verses
            if (findHighlightedVerse(verseId)) {
                changes[verseId] = null
            }
            return
        }

        var verseData =  verses.value.find(v => v.ID === verseId)

        changes[verseId] = {
            verseId: verseId,
            color: color,
            book: verseData.B,
            bookId: verseData.BID,
            timestamp: new Date().toISOString(),
            chapter: verseData.C,
            verse: parseInt(String(verseId).slice(-3)),
        }
    })
    selectedVerses.value = []
    userData.setHighlights(changes)
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

const deletePlan = (planId) => {
    userData.deletePlan(planId)
    if (readingPlanContext.value?.planId === planId) {
        readingPlanContext.value = null
    }
}

const versePickerClosed = () => {
    showVersePicker.value = false
}

const changeChapter = (reference) => {
    bookId.value = reference.bookId
    chapter.value = reference.chapter
    showHistory.value = false
    return getVerses()
}

// Swiping left or right across the text goes to the next or previous chapter.
// Like turning a page: the text follows the finger with the neighbouring chapter
// right beside it, which slides into place and becomes the open chapter.
const swipeOffset = ref(0)
const swipeTransition = ref('none')
// scroll position and width when the swipe started, which place the neighbouring chapter
const swipeFrame = ref({ top: 0, width: 0 })
let swipe = null
let swipeBusy = false

const swipeStyle = computed(() => ({
    transform: swipeOffset.value ? `translate3d(${swipeOffset.value}px, 0, 0)` : 'none',
    transition: swipeTransition.value,
}))

// what to draw beside the text while it is dragged: the next chapter to the right, the previous to the left
const swipePreview = computed(() => {
    if (!swipeOffset.value) {
        return null
    }
    const direction = swipeOffset.value < 0 ? 1 : -1
    const target = direction > 0 ? nextChapter.value : prevChapter.value
    if (!hasChapter(target)) {
        return null
    }
    cachedChapters.value // re-run when a chapter finishes loading mid-swipe
    const loaded = chapterCache.get(chapterKey(target.bookId, target.chapter))
    return {
        top: swipeFrame.value.top,
        left: direction * swipeFrame.value.width,
        book: loaded?.verses[0].B ?? BOOKS_BY_ID[target.bookId]?.name,
        chapter: target.chapter,
        // enough to fill the screen
        verses: loaded ? loaded.verses.slice(0, 40) : [],
    }
})

// Genesis 1 and Revelation 22 point at themselves as previous and next
const hasChapter = (target) => Boolean(target?.bookId)
    && !(Number(target.bookId) === Number(bookId.value) && Number(target.chapter) === Number(chapter.value))

const animateSwipe = (offset, ms) => new Promise(resolve => {
    swipeTransition.value = ms ? `transform ${ms}ms ease-out` : 'none'
    swipeOffset.value = offset
    setTimeout(resolve, ms)
})

const onSwipeStart = (e) => {
    if (swipeBusy || e.touches.length !== 1) {
        swipe = null
        return
    }
    const touch = e.touches[0]
    swipe = { x: touch.clientX, y: touch.clientY, time: e.timeStamp, dx: 0, axis: null }
}

const onSwipeMove = (e) => {
    if (!swipe || e.touches.length !== 1) {
        return
    }
    const touch = e.touches[0]
    const dx = touch.clientX - swipe.x
    const dy = touch.clientY - swipe.y

    if (!swipe.axis) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            return
        }
        // a selection handle being dragged is not a swipe
        const selecting = !(window.getSelection()?.isCollapsed ?? true)
        swipe.axis = !selecting && Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y'
        if (swipe.axis === 'x') {
            swipeTransition.value = 'none'
            swipeFrame.value = { top: versesContainer.value.scrollTop, width: versesContainer.value.clientWidth }
        }
    }
    if (swipe.axis !== 'x') {
        return
    }
    if (e.cancelable) {
        e.preventDefault()
    }
    swipe.dx = dx
    const target = dx < 0 ? nextChapter.value : prevChapter.value
    // resist when there is no chapter that way
    swipeOffset.value = hasChapter(target) ? dx : dx / 4
}

const onSwipeEnd = async (e) => {
    const s = swipe
    swipe = null
    if (!s || s.axis !== 'x') {
        return
    }
    const width = swipeFrame.value.width
    const velocity = s.dx / Math.max(e.timeStamp - s.time, 1)
    const target = s.dx < 0 ? nextChapter.value : prevChapter.value
    const farEnough = Math.abs(s.dx) > width * 0.25 || (Math.abs(s.dx) > 40 && Math.abs(velocity) > 0.4)

    if (!farEnough || !hasChapter(target)) {
        animateSwipe(0, 200)
        return
    }

    swipeBusy = true
    const direction = Math.sign(s.dx)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    try {
        // the neighbouring chapter is now where the text was
        await animateSwipe(direction * width, reduceMotion ? 0 : 220)
        // usually already loaded, so it swaps in before the next frame and the switch can't be seen
        const loaded = await changeChapter(target)
        if (!loaded) {
            await animateSwipe(0, reduceMotion ? 0 : 220)
        }
    } finally {
        swipeTransition.value = 'none'
        swipeOffset.value = 0
        swipeBusy = false
    }
}

const onSwipeCancel = () => {
    swipe = null
    if (!swipeBusy && swipeOffset.value) {
        animateSwipe(0, 200)
    }
}

const scrollToVerse = (verseId) => {
    const verse = document.getElementById(verseId)
    if (verse) {
        verse.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
}

// Chapters read this session, plus the ones on either side of the open chapter,
// so a swipe can show the neighbouring chapter and switch to it without waiting.
const chapterCache = new Map()
const CHAPTER_CACHE_SIZE = 12
// counts chapters added, so views of the cache update
const cachedChapters = ref(0)

const chapterKey = (bookId, chapter) => `${Number(bookId)}/${Number(chapter)}`

// { verses, prev, next } for a chapter, or null when the API has no verses for it
const fetchChapter = async (bookId, chapter) => {
    const key = chapterKey(bookId, chapter)
    if (chapterCache.has(key)) {
        return chapterCache.get(key)
    }
    const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv/${bookId}/${chapter}`)
    const v = response.data.v
    if (!v || v.length === 0) {
        return null
    }

    // the API adds the verse before and the verse after the chapter, which point at its neighbours
    const first = v[0]
    const last = v[v.length - 1]
    const start = (first.BID === v[1]?.BID && first.C === v[1]?.C) ? 0 : 1
    const end = (last.BID === v[v.length - 2]?.BID && last.C === v[v.length - 2]?.C) ? v.length : v.length - 1
    const parsed = {
        verses: v.slice(start, end),
        prev: { bookId: first.BID, chapter: first.C },
        next: { bookId: last.BID, chapter: last.C },
    }

    chapterCache.delete(key)
    chapterCache.set(key, parsed)
    if (chapterCache.size > CHAPTER_CACHE_SIZE) {
        chapterCache.delete(chapterCache.keys().next().value)
    }
    cachedChapters.value++
    return parsed
}

const prefetchChapter = (target) => {
    if (hasChapter(target)) {
        fetchChapter(target.bookId, target.chapter).catch(() => {})
    }
}

// resolves true once the chapter is on screen
const getVerses = async (verseId) => {
    presentedVerses.value = []
    try {
        const loaded = await fetchChapter(bookId.value, chapter.value)
        if (!loaded) {
            return false
        }

        prevChapter.value = loaded.prev
        nextChapter.value = loaded.next
        verses.value = loaded.verses
        bookId.value = loaded.verses[0].BID
        book.value = loaded.verses[0].B
        chapter.value = loaded.verses[0].C
        prefetchChapter(loaded.prev)
        prefetchChapter(loaded.next)
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
        return true
    } catch (error) {
        console.error(error)
        const requested = `${BOOKS_BY_ID[bookId.value]?.name ?? ''} ${chapter.value}`.trim()
        // point the header back at the chapter that is still on screen
        if (verses.value.length > 0) {
            bookId.value = verses.value[0].BID
            book.value = verses.value[0].B
            chapter.value = verses.value[0].C
        }
        showLoadError(error.response
            ? `Couldn't load ${requested}. Please try again.`
            : `${requested} isn't available offline yet.`)
        return false
    }
}

onMounted(async () => {
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
