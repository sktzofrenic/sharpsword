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

                    <div class="sm:flex sm:items-start">
                        <div class="mt-6 text-center">
                            <div class="my-2">
                                <div class="relative">
                                    <label for="name" class="absolute -top-3 left-2 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-100 rounded-md">Search</label>
                                    <input type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6" placeholder="Anything..." v-model="searchTerm">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 h-[75vh] overflow-y-auto pr-2">
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md divide-y divide-slate-600" v-for="result in results">
                            <div v-html="result.H"></div>
                            <div class="text-slate-300 text-sm justify-between flex mt-2 pt-2">
                                <span class="font-bold">{{result.B}} {{result.C}}:{{result.V}}</span>
                                <span class="text-slate-300">{{result.R}}</span>
                            </div>
                        </div>
                        <div v-if="results.length === 0" class="text-slate-100 text-center mt-4">
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
import { onMounted, ref, computed, watch} from 'vue'
import { useBaseUrlStore } from '@/stores/baseUrlStore.js'
import http from '@/http'

const emits = defineEmits(['close', 'verseSelected'])
const baseUrl = useBaseUrlStore()
const searchTerm = ref('')

const close = () => {
    emits('close')
}

// watch search term and debounce search()

watch(searchTerm, () => {
    search()
})



const results = ref([])

const search = async () => {
    if (searchTerm.value.length < 2) {
        results.value = []
        return
    }

    try {
        const response = await http.get(`${baseUrl.baseUrl}/api/v1/bible/kjv/search?q=${searchTerm.value}`)
        results.value = response.data.r
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    search()
})



</script>
