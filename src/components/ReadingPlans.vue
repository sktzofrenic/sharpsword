<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[20vw] top-20">
        <div class="px-4 py-2 bg-slate-900 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl relative">
            <h3 class="font-semibold text-slate-400 pt-2">Reading Plans</h3>
            <div class="absolute right-0 top-0 pr-4 pt-4">
                <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="text-slate-100">
                <div class="mt-2 flow-root">
                    <div class="-mx-4 -my-2 overflow-x-auto max-h-[60vh]">
                        <div class="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                            <div v-for="plan in readingPlans" @click="goBack(item)">
                                {{ plan }}
                            </div>
                            <div v-if="readingPlans.length === 0" class="text-slate-400 text-center my-4">
                                No reading plans loaded
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { formatDate } from '@/assets/js/dateFormat.js'

const emits = defineEmits(['close', 'verseSelected'])
const props = defineProps({
    readingPlans: {
        type: Array,
        default: []
    }
})

const selectPassage = (item) => {
    emits('verseSelected', {
        bookId: item.bookId,
        book: item.book,
        chapter: item.chapter,
        verse: item.verse   
    })
}

const close = () => {
    emits('close')
}



</script>

<style scoped>
</style>
