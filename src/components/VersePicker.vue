<template>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden w-full rounded-lg bg-slate-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div class="absolute right-0 top-0 pr-4 pt-4">
                        <button type="button" class="rounded-md bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="close">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-slate-100 mb-4">
                        <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title">
                            <button type="button" 
                                class="rounded-md bg-slate-800 px-2 py-1 font-semibold text-slate-100 shadow-sm mr-4" 
                                @click="goBack" v-if="selectedBook || selectedChapter">
                                <i class="fa-solid fa-arrow-left"></i>
                                Back
                            </button>
                            <span v-if="selectedBook !== null">{{selectedBook.n}}</span>
                            <span v-else>Select a book</span>

                            <span v-if="selectedChapter !== null" class="ml-2">{{selectedChapter}}</span>
                            <span v-else></span>

                        </h3>
                    </div>
                    <Transition name="fade" mode="out-in">
                        <div class="h-[70vh] overflow-y-auto pr-2" v-if="selectedBook === null">
                            <div class="flex flex-wrap gap-4  overflow-y-auto pr-2">
                                <div class="text-slate-100 px-2 py-1 rounded-md bg-blue-900 cursor-pointer" 
                                    @click="selectBook(book)"
                                    v-for="(book, index) in otBooks">{{book.n}}</div>
                            </div>
                            <div class="relative my-4" v-if="ntBooks.length > 0">
                                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div class="w-full border-t border-slate-300"></div>
                                </div>
                                <div class="relative flex justify-center">
                                    <span class="bg-slate-900 px-2 text-sm text-slate-100">NT</span>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-4 overflow-y-auto pr-2">
                                <div class="text-slate-100 px-2 py-1 rounded-md bg-indigo-900 cursor-pointer" 
                                    @click="selectBook(book)"
                                    v-for="(book, index) in ntBooks">{{book.n}}</div>
                            </div>
                        </div>
                        <div class="h-[70vh] overflow-y-auto pr-2" v-else-if="selectedBook !== null && selectedChapter === null">
                            <div class="grid grid-cols-5 gap-4">
                                <div class="text-slate-100 px-4 py-2 rounded-md bg-slate-800 text-center cursor-pointer" 
                                    @click="selectChapter(index + 1)"
                                    v-for="(chapter, index) in chapters">{{index + 1}}</div>
                            </div>
                        </div>
                        <div class="h-[70vh] overflow-y-auto pr-2" v-else-if="selectedBook !== null && selectedChapter !== null">
                            <div class="grid grid-cols-5 gap-4">
                                <div class="text-slate-100 px-4 py-2 rounded-md bg-indigo-900 text-center cursor-pointer" 
                                    @click="selectVerse(verse)"
                                    v-for="(verse, index) in verses">{{verse}}</div>
                            </div>
                        </div>
                    </Transition>
                    <div class="sm:flex sm:items-start" v-if="selectedBook === null">
                        <div class="mt-6 text-center">
                            <div class="mt-2">
                                <div class="relative">
                                    <label for="name" class="absolute -top-3 left-2 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md">Filter</label>
                                    <input type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Book name..." v-model="searchTerm">
                                </div>
                            </div>
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
import { onMounted, ref, computed } from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import http from '@/http'

const emits = defineEmits(['close', 'verse'])
const baseUrl = useBaseUrlStore()
const bibleData = ref({ b: [] })
const selectedBook = ref(null)
const selectedChapter = ref(null)
const searchTerm = ref('')

const close = () => {
    emits('close')
}

const goBack = () => {
    if (selectedChapter.value) {
        selectedChapter.value = null
    } else {
        selectedBook.value = null
    }
}

const selectVerse = (verse) => {
    emits('verse', {
        book: selectedBook.value.i,
        chapter: selectedChapter.value,
        verse: verse
    })
}

const selectBook = (book) => {
    selectedBook.value = book
}

const selectChapter = (chapter) => {
    selectedChapter.value = chapter
}

const otBooks = computed(() => {
    // if search term is not empty, filter books
    if (searchTerm.value) {
        return bibleData.value.b.filter(book => book.t === 'OT' && book.n.toLowerCase().includes(searchTerm.value.toLowerCase()))
    }
    return bibleData.value.b.filter(book => book.t === 'OT')
})

const ntBooks = computed(() => {
    // if search term is not empty, filter books
    if (searchTerm.value) {
        return bibleData.value.b.filter(book => book.t === 'NT' && book.n.toLowerCase().includes(searchTerm.value.toLowerCase()))
    }
    return bibleData.value.b.filter(book => book.t === 'NT')
})

const chapters = computed(() => {
    return selectedBook.value.c
})

const verses = computed(() => {
    return Array.from({ length: selectedBook.value.c[selectedChapter.value - 1].v}, (_, i) => i + 1)
})

const getBibleData = async () => {
    try {
        const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv`)
        bibleData.value = response.data
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    getBibleData()
})



</script>
