<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[20vw] top-20">
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
                <div class="mt-2 flow-root">
                    <div class="-mx-4 -my-2 overflow-x-auto max-h-[60vh]">
                        <div class="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                            <table class="min-w-full divide-y divide-slate-700">
                                <tbody class="divide-y divide-slate-800">
                                    <tr v-for="item in history" @click="goBack(item)">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-lg font-medium text-white sm:pl-0 cursor-pointer" >
                                            {{item.book}} {{item.chapter}}
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
                            <div v-if="history.length === 0" class="text-slate-400 text-center mt-4">
                                Nothing in your history yet...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'

const emits = defineEmits(['close', 'changeChapter'])
const props = defineProps({
    history: {
        type: Array,
        default: []
    }
})

const goBack = (item) => {
    emits('changeChapter', {
        bookId: item.bookId,
        chapter: item.chapter
    })
}

const close = () => {
    emits('close')
}



</script>
