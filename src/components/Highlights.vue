<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[20vw] top-20">
        <div class="px-4 py-2 bg-slate-900 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl relative">
            <h3 class="font-semibold text-slate-400 pt-2">Highlights</h3>
            <div class="absolute right-0 top-0 pr-4 pt-4">
                <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

                    <div class="sm:flex sm:items-start">
                        <div class="mt-6 text-center">
                            <div class="my-2">
                                <div class="relative">
                                    <label for="name" class="absolute -top-3 left-2 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md">
                                        Keyword Search
                                    </label>
                                    <input type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6" placeholder="Anything..." v-model="searchTerm" ref="search" @click="focusAndSelect">
                                </div>
                            </div>
                        </div>
                    </div>
            <div class="text-slate-100">
                <div class="mt-2 flow-root">
                    <div class="-mx-4 -my-2 overflow-x-auto max-h-[60vh]">
                        <div class="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                            <table class="min-w-full divide-y divide-slate-700">
                                <tbody class="divide-y divide-slate-800">
                                    <tr v-for="item in filteredHighlights" @click="goBack(item)">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-lg font-medium text-white sm:pl-0 cursor-pointer" >
                                            <span :class="[item.color]">
                                                {{item.book}} {{item.chapter}}:{{item.verse}}
                                            </span>
                                            <div class="text-xs text-slate-500">{{formatDate(item.timestamp, 'l LTS')}}</div>
                                        </td>
                                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-800">
                                                Go Here
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <!-- add a  message if there are no history items -->
                            <div v-if="highlights.length === 0" class="text-slate-400 text-center mt-4">
                                Nothing highlighted yet...
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
