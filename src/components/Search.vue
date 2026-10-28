<template>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-slate-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6">
                    <div class="absolute right-0 top-0 pr-4 pt-4">
                        <button type="button" class="rounded-md bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="close">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- where to search: everything, a testament, or chosen books -->
                    <div class="flex justify-between mr-12 gap-1">
                        <button @click="setScope('')" :class="{'bg-slate-700 text-slate-100': isActiveScope('')}" class="text-slate-300 px-2 py-1 rounded-md">All</button>
                        <button @click="setScope('OT')" :class="{'bg-slate-700 text-slate-100': isActiveScope('OT')}" class="text-slate-300 px-2 py-1 rounded-md">
                            <span class="sm:hidden">OT</span><span class="hidden sm:inline">Old Testament</span>
                        </button>
                        <button @click="setScope('NT')" :class="{'bg-slate-700 text-slate-100': isActiveScope('NT')}" class="text-slate-300 px-2 py-1 rounded-md">
                            <span class="sm:hidden">NT</span><span class="hidden sm:inline">New Testament</span>
                        </button>
                        <button @click="openBookPicker" :class="{'bg-slate-700 text-slate-100': isActiveScope('books')}" class="text-slate-300 px-2 py-1 rounded-md whitespace-nowrap">
                            Books<span v-if="appliedBooks.length > 0"> ({{ appliedBooks.length }})</span>
                        </button>
                    </div>
                    <div class="text-xs text-slate-400 mt-2 truncate" v-if="scope === 'books' && !showBookPicker">
                        Searching {{ appliedBookNames }}
                    </div>

                    <div class="sm:flex sm:items-start">
                        <div class="mt-6 text-center w-full">
                            <div class="my-2">
                                <div class="relative">
                                    <label for="name" class="absolute -top-3 left-2 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md whitespace-nowrap">
                                        Keyword Search
                                        <span class="text-red-500" v-if="totalResults > 0">
                                            ({{ totalResults.toLocaleString() }} hits)
                                        </span>
                                    </label>
                                    <input type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6" placeholder="Anything..." v-model="searchTerm" ref="search" @click="focusAndSelect">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="h-[70vh] overflow-y-auto pr-2 text-slate-100" v-if="showBookPicker">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-slate-400">{{ draftBooks.length }} selected</span>
                            <span class="flex items-center gap-4 text-sm">
                                <button class="text-slate-400 hover:text-slate-200 underline-offset-4 underline" v-if="draftBooks.length > 0" @click="draftBooks = []">Clear</button>
                                <button class="px-3 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white" @click="applyBooks">Done</button>
                            </span>
                        </div>
                        <div v-for="group in BOOK_GROUPS" :key="group.title">
                            <div class="flex items-center justify-between mt-4 mb-2">
                                <span class="text-xs uppercase tracking-wide text-slate-400">{{ group.title }}</span>
                                <button class="text-xs text-slate-400 hover:text-slate-200" @click="toggleGroup(group)">
                                    {{ isGroupSelected(group) ? 'Clear' : 'Select all' }}
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="book in group.books" :key="book.id"
                                    class="px-2 py-1 rounded-md text-sm"
                                    :class="draftBooks.includes(book.id) ? 'bg-slate-300 text-slate-900' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'"
                                    :aria-pressed="draftBooks.includes(book.id)"
                                    @click="toggleBook(book.id)"
                                >
                                    {{ book.name }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 h-[70vh] overflow-y-auto pr-2" ref="resultsList" @scroll.passive="showMoreIfNearEnd" v-show="!showBookPicker">
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md divide-y divide-slate-600 hover:bg-slate-700 cursor-pointer"
                            @click="selectVerse(result)"
                            v-for="result in visibleResults" :key="result.ID">
                            <div v-html="result.H"></div>
                            <div class="text-slate-300 text-sm justify-between flex mt-2 pt-2">
                                <span class="font-bold">{{result.B}} {{result.C}}:{{result.V}}</span>
                                <span class="text-slate-300">{{result.R}}</span>
                            </div>
                        </div>
                        <div v-if="visibleResults.length < results.length" class="text-slate-500 text-center text-sm py-4">
                            Showing {{ visibleResults.length.toLocaleString() }} of {{ results.length.toLocaleString() }}…
                        </div>
                        <div v-if="searchError" class="text-slate-400 text-center mt-4">
                            {{ searchError }}
                        </div>
                        <div v-else-if="results.length === 0" class="text-slate-100 text-center mt-4">
                            No results found
                        </div>
                    </div>

                    <div class=" sm:mt-4 sm:flex sm:flex-row-reverse">
                        
                        <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 sm:mt-0 sm:w-auto" @click="close">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, useTemplateRef, nextTick} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import http from '@/http'
import { BOOKS } from '@/assets/js/books.js'

const BOOK_GROUPS = [
    { title: 'Old Testament', books: BOOKS.filter(b => b.id <= 39) },
    { title: 'New Testament', books: BOOKS.filter(b => b.id >= 40) },
]

const emits = defineEmits(['close', 'verseSelected'])
const props = defineProps(['visible'])
const baseUrl = useBaseUrlStore()
const searchTerm = ref('')
// '' (everything), 'OT', 'NT', or 'books' for the books chosen in the picker
const scope = ref('')
const appliedBooks = ref([])
const draftBooks = ref([])
const showBookPicker = ref(false)
const totalResults = ref(0)
const results = ref([])
const searchError = ref('')
const searchElement = useTemplateRef('search')

// watch visible and focus search input and select all text in input when true
watch(() => props.visible, (newValue, oldValue) => {
    if (newValue) {
        setTimeout(() => {
            searchElement.value.focus()
            searchElement.value.select()
        }, 100)
    }
})

const focusAndSelect = () => {
    searchElement.value.focus()
    searchElement.value.select()
}

// book ids sent to the server; empty searches every book
const booksParam = computed(() => {
    const ids = {
        '': [],
        OT: BOOK_GROUPS[0].books.map(b => b.id),
        NT: BOOK_GROUPS[1].books.map(b => b.id),
        books: appliedBooks.value,
    }[scope.value]
    return ids.join(',')
})

const appliedBookNames = computed(() => {
    return BOOKS.filter(b => appliedBooks.value.includes(b.id)).map(b => b.name).join(', ')
})

const isActiveScope = (value) => showBookPicker.value ? value === 'books' : scope.value === value

const setScope = (value) => {
    showBookPicker.value = false
    scope.value = value
}

const openBookPicker = () => {
    draftBooks.value = [...appliedBooks.value]
    showBookPicker.value = true
}

const toggleBook = (id) => {
    draftBooks.value = draftBooks.value.includes(id)
        ? draftBooks.value.filter(b => b !== id)
        : [...draftBooks.value, id]
}

const isGroupSelected = (group) => group.books.every(b => draftBooks.value.includes(b.id))

const toggleGroup = (group) => {
    const ids = group.books.map(b => b.id)
    draftBooks.value = isGroupSelected(group)
        ? draftBooks.value.filter(id => !ids.includes(id))
        : [...new Set([...draftBooks.value, ...ids])]
}

// choices only take effect on Done, so toggling books doesn't search each time
const applyBooks = () => {
    appliedBooks.value = [...draftBooks.value].sort((a, b) => a - b)
    showBookPicker.value = false
    if (appliedBooks.value.length > 0) {
        scope.value = 'books'
    } else if (scope.value === 'books') {
        scope.value = ''
    }
}

// Common words match tens of thousands of verses, so results are rendered
// a page at a time as the list is scrolled.
const PAGE_SIZE = 100
const shownCount = ref(PAGE_SIZE)
const resultsList = useTemplateRef('resultsList')

const visibleResults = computed(() => results.value.slice(0, shownCount.value))

const showMoreIfNearEnd = async () => {
    const list = resultsList.value
    // a hidden list (search closed) has no height and would load everything
    if (!list || list.clientHeight === 0 || shownCount.value >= results.value.length) {
        return
    }
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 600) {
        shownCount.value += PAGE_SIZE
        // keep going if the new page still doesn't fill the list
        await nextTick()
        showMoreIfNearEnd()
    }
}

// start back at the top for a new search or scope
watch(results, async () => {
    shownCount.value = PAGE_SIZE
    if (resultsList.value) {
        resultsList.value.scrollTop = 0
    }
    await nextTick()
    showMoreIfNearEnd()
})

const selectVerse = (verse) => {
    emits('verseSelected', {
        bookId: verse.BID,
        book: verse.B,
        chapter: verse.C,
        verse: verse.V
    })
}

const close = () => {
    emits('close')
}


watch([searchTerm, booksParam], () => {
    search()
})



// Search runs on every keystroke and broad searches are slower, so a response
// can arrive after a newer one; only the latest search may update results.
let latestSearch = 0

const search = async () => {
    const searchId = ++latestSearch
    try {
        const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv/search`, {
            params: { q: searchTerm.value, books: booksParam.value || undefined },
        })
        if (searchId !== latestSearch) {
            return
        }
        results.value = response.data.r
        totalResults.value = response.data.c
        searchError.value = ''
    } catch (error) {
        console.error(error)
        if (searchId !== latestSearch) {
            return
        }
        results.value = []
        totalResults.value = 0
        searchError.value = error.response
            ? 'Search failed. Please try again.'
            : 'Search needs an internet connection.'
    }
}

onMounted(() => {
    search()
})



</script>
