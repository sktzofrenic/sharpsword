<template>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true">
        </div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden w-full rounded-lg bg-slate-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div class="absolute right-0 top-0 pr-4 pt-4">
                        <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-slate-100 my-4 shadow-slate-900 shadow-lg">
                        <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title">
                            Select a Plan
                        </h3>
                    </div>
                    <div class="text-slate-100">
                        <div class="mt-2 flow-root">
                            <div class="-mx-4 -my-2 overflow-x-auto h-[70vh]">
                                <div class="inline-block min-w-full align-middle px-6">
                                    <div v-for="plan in plans" @click="goBack(item)">
                                        <div class="flex flex-row gap-6">
                                            <div>
                                                <img :src="plan.image"/>
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <div class="text-xl">
                                                    {{ plan.title }}
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    {{ plan.description }}
                                                </div>
                                                <div class="text-sm text-slate-400" v-if="plan.startDate">
                                                    Started {{ plan.startDate }}
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                                        @click="startPlan(plan)"
                                                    >
                                                        <i class="fa-solid fa-play pr-2"></i> Continue
                                                    </button>
                                                </div>
                                                <div class="text-sm text-slate-400" v-else>
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                                        @click="startPlan(plan)"
                                                    >
                                                        <i class="fa-solid fa-play pr-2"></i> Start
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="plans.length === 0" class="text-slate-400 text-center my-4">
                                        No reading plans loaded
                                    </div>
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
import {ref, computed} from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { formatDate } from '@/assets/js/dateFormat.js'

const emits = defineEmits(['close', 'verseSelected'])
const props = defineProps({
    plans: {
        type: Array,
        default: []
    }
})

const startPlan = (plan) => {

}

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
