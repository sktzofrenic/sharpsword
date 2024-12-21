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
                        <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title" v-if="activePlan">
                            {{ activePlan.title }}
                            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                @click="goBack()"
                            >
                             Back
                            </button>
                        </h3>
                        <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title" v-else>
                            Select a Plan
                        </h3>
                    </div>
                    <div class="text-slate-100">
                        <div class="mt-2 flow-root">
                            <div class="-mx-4 -my-2  h-[70vh]">
                                <div class="inline-block min-w-full align-middle px-6" v-if="activePlan">
                                    <div class="flex flex-row flex-nowrap gap-2 mt-2 overflow-x-auto max-w-[90%] pb-2">
                                        <div v-for="day in activePlan.days">
                                            <div class="text-lg text-slate-100 rounded-md bg-slate-800 flex flex-col items-center px-4 py-2"
                                                :class="{'bg-slate-400': activeDay?.day === day.day}"
                                              @click="selectDay(day)"
                                            >
                                                <div class="">
                                                    {{ day.day }}
                                                </div>
                                                <div class="text-xs text-nowrap">
                                                    Dec 20
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-4" v-if="activeDay">
                                        <div class="text-lg text-slate-100">
                                            Day {{ activeDay.day }} of {{ activePlan.days.length }}
                                        </div>
                                        <div class="text-sm text-slate-400">
                                            Dec 20
                                        </div>
                                        <div class="mt-4">
                                            <div class="flex flex-col gap-4">
                                                <div v-for="passage in activeDay.passages">
                                                    <div class="flex flex-row gap-4 text-xl">
                                                        <div class="text-slate-100" @click="completePassage(passage, activeDay, activePlan)">
                                                            <i class="fa-solid fa-circle-check" v-if="passage.completedOn"></i>
                                                            <i class="fa-regular fa-circle" v-else></i>
                                                        </div>
                                                        <div class="text-slate-100">
                                                            {{ passage.reference}}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="inline-block min-w-full align-middle px-6" v-else>
                                    <div v-for="plan in plans">
                                        <div class="flex flex-row gap-6">
                                            <div>
                                                <img class="rounded-lg shadow-black shadow-lg" :src="plan.image"/>
                                                <div v-if="!deletePlanCheck">
                                                    <div class="text-slate-600 hover:text-slate-200 px-4 py-2 underline-offset-4 underline"
                                                        @click="deletePlanCheck = true"
                                                    >
                                                        Delete
                                                    </div>
                                                </div>
                                                <div v-else>
                                                    <div class="relative z-0 inline-flex items-center gap-x-1.5 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-slate-700 mt-2">
                                                        Delete?
                                                    </div>
                                                    <span class="isolate inline-flex rounded-md shadow-sm mt-2">
                                                        <button type="button" class="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-red-900 px-3 py-2 text-sm font-semibold text-red-100 ring-1 ring-inset ring-red-300 hover:bg-red-600 focus:z-10" @click="deletePlan(plan)">
                                                            Yes
                                                        </button>
                                                        <button type="button" class="relative -ml-px inline-flex items-center rounded-r-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-gray-300 hover:bg-slate-600 focus:z-10" @click="deletePlanCheck = false">No</button>
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <div class="text-xl">
                                                    {{ plan.title }}
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    {{ plan.description }}
                                                </div>
                                                <div class="text-sm text-slate-400 flex gap-4" v-if="plan.startDate">
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                                        @click="startPlan(plan)"
                                                    >
                                                        <i class="fa-solid fa-play sm:pr-2"></i> 
                                                        <span class="hidden sm:inline-block">Continue</span>
                                                    </button>
                                                    <span class="px-4 py-2">
                                                        Started {{ formatDate(plan.startDate) }}
                                                    </span>
                                                </div>
                                                <div class="text-sm text-slate-400" v-else>
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                                        @click="startPlan(plan)"
                                                    >
                                                        <i class="fa-solid fa-play pr-2"></i> Start
                                                    </button>
                                                </div>
                                                <div>
                                                    <div class="mt-2" aria-hidden="true">
                                                        <div class="overflow-hidden rounded-full bg-slate-200">
                                                            <div class="h-2 rounded-full bg-slate-600" :style="{'width': getProgressPercentage(plan) + '%'}"></div>
                                                        </div>
                                                    </div>
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

const activePlan = ref(null)
const activeDay = ref(null)
const deletePlanCheck = ref(false)
const emits = defineEmits(['close', 'verseSelected', 'deletePlan', 'startPlan', 'completePassage'])
const props = defineProps({
    plans: {
        type: Array,
        default: []
    }
})

const completePassage = (passage, day, plan) => {
    emits('completePassage', { passage, day, plan })
}

const startPlan = (plan) => {
    activePlan.value = plan
}

const deletePlan = (plan) => {
    emits('deletePlan', plan)
}

const goBack = () => {
    activePlan.value = null
}

const selectDay = (day) => {
    activeDay.value = day
}

const getProgressPercentage = (plan) => {

    let completed = 0
    let total = 0
    plan.days.forEach(day => {
        day.passages.forEach(passage => {
            if (passage.completedOn) {
                completed++
            }
            total++
        })
    })

    return Math.round((completed / total) * 100)
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
