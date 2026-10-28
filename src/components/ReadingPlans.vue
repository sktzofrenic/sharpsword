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
                    <div class="text-slate-100 my-4 pr-8">
                        <div class="flex items-center gap-3" v-if="activePlan">
                            <button class="text-slate-100 hover:text-slate-200 px-3 py-1 rounded-lg bg-slate-700 text-sm"
                                @click="goBack()"
                            >
                                <i class="fa-solid fa-left"></i>
                            </button>
                            <div>
                                <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title">
                                    {{ activePlan.title }}
                                </h3>
                                <div class="text-sm text-slate-400">
                                    {{ completedDays(activePlan) }} of {{ activePlan.days.length }} days complete
                                    <span v-if="activePlanBehind > 0"> · {{ activePlanBehind }} {{ activePlanBehind === 1 ? 'day' : 'days' }} behind</span>
                                </div>
                            </div>
                        </div>
                        <h3 class="text-lg font-medium leading-6 text-slate-100" id="modal-title" v-else>
                            Reading Plans
                        </h3>
                    </div>
                    <div class="text-slate-100">
                        <div class="mt-2 flow-root">
                            <div class="-mx-4 -my-2 h-[70vh] overflow-y-auto overflow-x-hidden">
                                <div class="px-6 min-w-0" v-if="activePlan">
                                    <div class="flex flex-row flex-nowrap gap-2 mt-2 overflow-x-auto pb-2" ref="dayStrip">
                                        <button v-for="day in activePlan.days" :key="day.day"
                                            :id="`plan-day-${day.day}`"
                                            class="text-lg rounded-md flex flex-col items-center px-4 py-2 shrink-0"
                                            :class="{
                                                'bg-slate-400 text-slate-900': activeDayNumber === day.day,
                                                'bg-slate-800 text-slate-100': activeDayNumber !== day.day,
                                                'ring-2 ring-inset ring-slate-400': activeDayNumber !== day.day && day.day === activePlanToday,
                                            }"
                                            @click="selectDay(day.day)"
                                        >
                                            <div class="flex items-center gap-1">
                                                {{ day.day }}
                                                <i class="fa-solid fa-circle-check text-xs" v-if="isDayComplete(day)"></i>
                                                <i class="fa-solid fa-circle-half-stroke text-xs" v-else-if="isDayStarted(day)"></i>
                                            </div>
                                            <div class="text-xs text-nowrap">
                                                {{ dayDate(activePlan, day.day).format('MMM D') }}
                                            </div>
                                        </button>
                                    </div>
                                    <div class="mt-4" v-if="activeDay">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <div class="text-lg text-slate-100">
                                                    Day {{ activeDay.day }} of {{ activePlan.days.length }}
                                                    <span class="text-xs uppercase tracking-wide bg-slate-700 rounded px-2 py-1 ml-2 align-middle" v-if="activeDay.day === activePlanToday">Today</span>
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    {{ dayDate(activePlan, activeDay.day).format('dddd, MMM D, YYYY') }}
                                                </div>
                                            </div>
                                            <button class="text-sm text-slate-100 hover:text-slate-200 px-3 py-2 rounded-lg bg-slate-700"
                                                v-if="!isDayComplete(activeDay) && activeDay.passages.length > 0"
                                                @click="setDayComplete(true)"
                                            >
                                                Mark all read
                                            </button>
                                            <button class="text-sm text-slate-400 hover:text-slate-200 px-3 py-2"
                                                v-else-if="activeDay.passages.length > 0"
                                                @click="setDayComplete(false)"
                                            >
                                                Mark unread
                                            </button>
                                        </div>
                                        <div class="mt-4">
                                            <div class="flex flex-col gap-4">
                                                <div v-for="(passage, index) in activeDay.passages" :key="`${activeDay.day}-${index}`">
                                                    <div class="flex flex-row gap-4 text-xl items-center">
                                                        <button class="text-slate-100" @click="togglePassage(index)"
                                                            :aria-label="passage.completedOn ? `Mark ${passage.reference} unread` : `Mark ${passage.reference} read`"
                                                        >
                                                            <i class="fa-solid fa-circle-check" v-if="passage.completedOn"></i>
                                                            <i class="fa-regular fa-circle" v-else></i>
                                                        </button>
                                                        <button class="text-slate-100 hover:text-slate-300 underline-offset-4 hover:underline text-left grow"
                                                            :class="{'text-slate-400': passage.completedOn}"
                                                            @click="openPassage(index)"
                                                        >
                                                            {{ passage.reference }}
                                                        </button>
                                                        <button class="text-slate-500 hover:text-slate-200 text-base" @click="openPassage(index)" aria-hidden="true" tabindex="-1">
                                                            <i class="fa-solid fa-book-open"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div v-if="activeDay.passages.length === 0" class="text-slate-400">
                                                    No readings scheduled for this day.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-xs text-slate-500 mt-8" v-if="activePlan.attribution">
                                        {{ activePlan.attribution }}
                                    </div>
                                </div>
                                <div class="px-6" v-else>
                                    <div class="text-sm uppercase tracking-wide text-slate-400 mb-2" v-if="plans.length > 0">
                                        My Plans
                                    </div>
                                    <div v-for="plan in plans" :key="plan.id" class="mb-6">
                                        <div class="flex flex-row gap-6">
                                            <div class="flex flex-col gap-2 grow">
                                                <div class="text-xl">
                                                    {{ plan.title }}
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    Started {{ formatDate(planStartDate(plan)) }} · Day {{ todaysDay(plan) }} of {{ plan.days.length }}
                                                </div>
                                                <div>
                                                    <div class="overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
                                                        <div class="h-2 rounded-full bg-slate-300" :style="{'width': progressPercentage(plan) + '%'}"></div>
                                                    </div>
                                                    <div class="text-xs text-slate-400 mt-1">
                                                        {{ completedDays(plan) }} of {{ plan.days.length }} days complete · {{ progressPercentage(plan) }}%
                                                    </div>
                                                </div>
                                                <div class="text-sm text-slate-400 flex gap-4 items-center">
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700"
                                                        @click="openPlan(plan)"
                                                    >
                                                        <i class="fa-solid fa-play pr-2"></i> Continue
                                                    </button>
                                                    <button class="text-slate-600 hover:text-slate-200 px-2 py-2 underline-offset-4 underline"
                                                        v-if="deleteCheckId !== plan.id"
                                                        @click="deleteCheckId = plan.id"
                                                    >
                                                        Delete
                                                    </button>
                                                    <span class="isolate inline-flex rounded-md shadow-sm items-center gap-2" v-else>
                                                        <span class="text-slate-100">Delete?</span>
                                                        <span class="inline-flex">
                                                            <button type="button" class="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-red-900 px-3 py-2 text-sm font-semibold text-red-100 ring-1 ring-inset ring-red-300 hover:bg-red-600 focus:z-10" @click="deletePlan(plan)">
                                                                Yes
                                                            </button>
                                                            <button type="button" class="relative -ml-px inline-flex items-center rounded-r-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-gray-300 hover:bg-slate-600 focus:z-10" @click="deleteCheckId = null">No</button>
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-sm uppercase tracking-wide text-slate-400 mb-2 mt-4" v-if="availablePlans.length > 0">
                                        Available Plans
                                    </div>
                                    <div v-for="template in availablePlans" :key="template.slug" class="mb-6">
                                        <div class="flex flex-row gap-6">
                                            <div class="flex flex-col gap-2 grow">
                                                <div class="text-xl">
                                                    {{ template.title }}
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    {{ template.description }}
                                                </div>
                                                <div class="text-xs text-slate-500">
                                                    {{ template.length }} days
                                                </div>
                                                <div class="text-sm text-slate-400">
                                                    <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-700 disabled:opacity-50"
                                                        :disabled="startingSlug === template.slug"
                                                        @click="startPlan(template)"
                                                    >
                                                        <i class="fa-solid fa-play pr-2"></i> Start
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="startError" class="text-red-300 text-sm my-4">
                                        {{ startError }}
                                    </div>
                                    <div v-if="plans.length === 0 && availablePlans.length === 0" class="text-slate-400 text-center my-4">
                                        No reading plans available
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class=" sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 sm:mt-0 sm:w-auto" @click="close">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, nextTick, onMounted} from 'vue'
import { formatDate } from '@/assets/js/dateFormat.js'
import {
    PLAN_CATALOG,
    completedDays,
    createPlan,
    dayDate,
    daysBehind,
    isDayComplete,
    isDayStarted,
    planStartDate,
    progressPercentage,
    todaysDay,
} from '@/assets/js/plans.js'

const emits = defineEmits(['close', 'startPlan', 'deletePlan', 'togglePassage', 'setDayComplete', 'openPassage'])
const props = defineProps({
    plans: {
        type: Array,
        default: () => []
    },
    // { planId, day } to open straight to, e.g. when coming back from a passage
    focus: {
        type: Object,
        default: null
    }
})

const activePlanId = ref(null)
const activeDayNumber = ref(null)
const deleteCheckId = ref(null)
const startingSlug = ref(null)
const startError = ref('')
const dayStrip = ref(null)

const activePlan = computed(() => props.plans.find(p => p.id === activePlanId.value) || null)
const activeDay = computed(() => activePlan.value?.days.find(d => d.day === activeDayNumber.value) || null)
const activePlanToday = computed(() => activePlan.value ? todaysDay(activePlan.value) : null)
const activePlanBehind = computed(() => activePlan.value ? daysBehind(activePlan.value) : 0)

// Plans that ship with the app and aren't already in progress
const availablePlans = computed(() => {
    return PLAN_CATALOG.filter(template => !props.plans.some(p => p.slug === template.slug))
})

const scrollToDay = async (day) => {
    await nextTick()
    // scroll only the day strip; scrollIntoView would also shift the modal and page
    const strip = dayStrip.value
    const button = document.getElementById(`plan-day-${day}`)
    if (strip && button) {
        strip.scrollLeft = button.offsetLeft - strip.offsetLeft - (strip.clientWidth - button.clientWidth) / 2
    }
}

const openPlan = (plan, day) => {
    activePlanId.value = plan.id
    activeDayNumber.value = day || todaysDay(plan)
    deleteCheckId.value = null
    scrollToDay(activeDayNumber.value)
}

const startPlan = async (template) => {
    startingSlug.value = template.slug
    startError.value = ''
    try {
        const module = await template.load()
        const plan = createPlan({ ...template, days: module.default.days })
        emits('startPlan', plan)
        await nextTick()
        openPlan(plan)
    } catch (error) {
        console.error(error)
        startError.value = `Couldn't start ${template.title}. Please try again.`
    } finally {
        startingSlug.value = null
    }
}

const deletePlan = (plan) => {
    deleteCheckId.value = null
    emits('deletePlan', plan.id)
}

const goBack = () => {
    activePlanId.value = null
    activeDayNumber.value = null
}

const selectDay = (day) => {
    activeDayNumber.value = day
}

const togglePassage = (index) => {
    emits('togglePassage', { planId: activePlan.value.id, day: activeDay.value.day, index })
}

const setDayComplete = (complete) => {
    emits('setDayComplete', { planId: activePlan.value.id, day: activeDay.value.day, complete })
}

const openPassage = (index) => {
    emits('openPassage', { planId: activePlan.value.id, day: activeDay.value.day, index })
}

const close = () => {
    emits('close')
}

onMounted(() => {
    const plan = props.focus && props.plans.find(p => p.id === props.focus.planId)
    if (plan) {
        openPlan(plan, props.focus.day)
    }
})

</script>

<style scoped>
</style>
