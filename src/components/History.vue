<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[26rem] top-20">
        <div class="px-4 py-2 bg-slate-900 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl relative">
            <h3 class="font-semibold text-slate-400 pt-2">History</h3>
            <div class="absolute right-0 top-0 pr-4 pt-4">
                <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="text-slate-100">
                <ul class="-mx-4 mt-2 max-h-[min(60vh,calc(100dvh-14rem))] overflow-y-auto overscroll-contain divide-y divide-slate-800">
                    <li v-for="item in history" :key="`${item.timestamp}:${item.bookId}.${item.chapter}.${item.verse}`">
                        <button class="group w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-800/60" @click="goBack(item)">
                            <span class="min-w-0">
                                <span class="block text-lg font-medium truncate text-white">{{item.book}} {{item.chapter}}:{{item.verse}}</span>
                                <span class="block text-xs text-slate-500">{{formatDate(item.timestamp, 'l LTS')}}</span>
                            </span>
                            <span class="shrink-0 text-sm font-medium text-slate-100 px-4 py-2 rounded-lg bg-slate-800 group-hover:bg-slate-700">
                                Go Here
                            </span>
                        </button>
                    </li>
                </ul>
                <div v-if="history.length === 0" class="text-slate-400 text-center my-4">
                    Nothing in your history yet...
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { formatDate } from '@/assets/js/dateFormat.js'

const emits = defineEmits(['close', 'verseSelected'])
const props = defineProps({
    history: {
        type: Array,
        default: []
    }
})


const goBack = (item) => {
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
