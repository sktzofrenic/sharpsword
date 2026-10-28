<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[26rem] top-20">
        <div class="px-4 py-2 bg-slate-900 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl relative">
            <h3 class="font-semibold text-slate-400 pt-2">Highlights</h3>
            <div class="absolute right-0 top-0 pr-4 pt-4">
                <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="relative mt-6 mb-2">
                <label for="highlight-filter" class="absolute -top-3 left-2 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md">
                    Filter by Book
                </label>
                <input id="highlight-filter" type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6" placeholder="Genesis..." v-model="searchTerm">
            </div>
            <div class="text-slate-100">
                <ul class="-mx-4 mt-2 max-h-[min(60vh,calc(100dvh-14rem))] overflow-y-auto overscroll-contain divide-y divide-slate-800">
                    <li v-for="item in filteredHighlights" :key="item.verseId">
                        <button class="group w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-800/60" @click="goBack(item)">
                            <span class="min-w-0">
                                <span class="block text-lg font-medium truncate" :class="[item.color]">{{item.book}} {{item.chapter}}:{{item.verse}}</span>
                                <span class="block text-xs text-slate-500">{{formatDate(item.timestamp, 'l LTS')}}</span>
                            </span>
                            <span class="shrink-0 text-sm font-medium text-slate-100 px-4 py-2 rounded-lg bg-slate-800 group-hover:bg-slate-700">
                                Go Here
                            </span>
                        </button>
                    </li>
                </ul>
                <div v-if="highlights.length === 0" class="text-slate-400 text-center my-4">
                    Nothing highlighted yet...
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
    highlights: {
        type: Array,
        default: []
    }
})

const searchTerm = ref('')

// Add computed filtered highlights
const filteredHighlights = computed(() => {
    return props.highlights.filter(item => {
        return `${item.book} ${item.chapter}:${item.verse}`.toLowerCase().includes(searchTerm.value.toLowerCase()) && item.book
    })
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

<style scoped>
.yellow {
    color: #f6e05e;
}
.red {
    color: #fc8181;
}
.blue {
    color: #63b3ed;
}
.lime {
    color: #a3e635;
}
.violet {
    color: #d6bcfa;
}
</style>
