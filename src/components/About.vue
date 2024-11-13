<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[20vw] top-20">
        <div class="px-4 py-2 bg-slate-800 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl">
            <h3 class="font-semibold text-slate-400 pt-2">About this App</h3>
            <div class="absolute right-0 top-0 pr-4 pt-4">
                <button type="button" class="rounded-md  text-slate-400 hover:text-gray-500" @click="close">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="text-slate-100 mt-6">
                <div class="divide-y divide-slate-600">
                    <dd class="mt-2 text-base/7 text-slate-400">
                        This app is open source and available on <a href="https://github.com/sktzofrenic/sharpsword" target="_blank" class="text-slate-200 hover:text-slate-100">GitHub</a> and contributions are welcome.
                    </dd>
                    <dd class="mt-2 text-base/7 text-slate-400 pt-2">
                        Live implementation of the app is available at <a href="https://sharpsword.io" target="_blank" class="text-slate-200 hover:text-slate-100">SharpSword.io</a> and is hosted for free, please consider a donation on our GitHub page. You can download and run your own copy as well.
                    </dd>
                    <dd class="mt-2 text-base/7 text-slate-400 pt-2">
                        Download your history, highlights, and plan data.

                        <Transition name="slide-fade">
                            <div v-if="msg" class="bg-slate-900 text-red-200 p-4 my-2 rounded-lg">
                                {{msg}}
                            </div>
                        </Transition>

                        <div class="flex justify-between mt-2 gap-2">
                            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900"
                                @click="downloadHistory"
                            >
                                <i class="fa-solid fa-download"></i> History
                            </button>
                            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900"
                                @click="downloadHighlights"
                            >
                                <i class="fa-solid fa-download"></i> Highlights
                            </button>
                            <button class="text-slate-100 hover:text-slate-200 px-4 py-2 rounded-lg bg-slate-900"
                                @click="downloadPlans"
                            >
                                <i class="fa-solid fa-download"></i> Plans
                            </button>
                        </div>
                    </dd>
                    <dd class="mt-2 text-base/7 text-slate-400 pt-2">
                        <p class="text-slate-200">Import data. Select whether you want to merge with your existing data or replace it. </p>
                        <div class="bg-slate-800 py-2 rounded-lg">
                            <div class="flex justify-between">
                                <label class="cursor-pointer flex-1 text-center p-2 rounded-lg transition-colors duration-300" :class="{'bg-slate-600 text-white': selected === 'merge', 'text-slate-600': selected !== 'merge'}" @click="selected = 'merge'">
                                    <input type="radio" name="action" value="merge" class="hidden" />
                                    Merge
                                </label>
                                <label class="cursor-pointer flex-1 text-center p-2 rounded-lg transition-colors duration-300" :class="{'bg-slate-600 text-white': selected === 'replace', 'text-slate-600': selected !== 'replace'}" @click="selected = 'replace'">
                                    <input type="radio" name="action" value="replace" class="hidden" />
                                    Replace
                                </label>
                            </div>
                        </div>
                        <div class="bg-slate-800 py-2 rounded-lg">
                            <label class="flex items-center justify-center w-full bg-slate-600 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-500 transition-colors duration-300">
                                <span class="text-slate-400">Choose File</span>
                                <input
                                    type="file"
                                    class="hidden"
                                    ref="file"
                                    @change="importData"
                                />
                            </label>
                        </div>
                    </dd>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'

const emits = defineEmits(['close', 'importData'])

const close = () => {
    emits('close')
}

const store = useAppStore()
const msg = ref('')
const selected = ref('merge')

const flash = (message) => {
    msg.value = message
    setTimeout(() => {
        msg.value = ''
    }, 3000)
}

const importData = (e) => {
    const file = e.target.files[0]
    if (!file) {
        flash('No file selected')
        return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result)
        if (!data.type) {
            flash('Invalid data')
            return
        }

        if (data.type === 'history') {
            importHistory({
                history: data.history,
                option: selected.value
            })
        } else if (data.type === 'highlight') {
            importHighlights({
                highlights: data.highlights,
                option: selected.value
            })
        } else if (data.type === 'plan') {
            importPlans({
                plans: data.plans,
                option: selected.value
            })
        } else {
            flash('Invalid data')
            return
        }
    }
    reader.readAsText(file)
    // clear the file input
    e.target.value = ''
}

const importHistory = (options) => {
    if (options.option === 'merge') {
        const history = JSON.parse(localStorage.getItem('history'))
        if (!history) {
            localStorage.setItem('history', JSON.stringify(options.history))
        } else {
            history.push(...options.history)
            // sort history by timestamp
            history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            localStorage.setItem('history', JSON.stringify(history))
        }
    } else {
        localStorage.setItem('history', JSON.stringify(options.history))
    }
    flash('History imported')
    emits('importData')
}

const importHighlights = (options) => {
    if (options.option === 'merge') {
        const highlights = JSON.parse(localStorage.getItem('highlightedVerses'))
        if (!highlights) {
            localStorage.setItem('highlightedVerses', JSON.stringify(options.highlights))
        } else {
            highlights.push(...options.highlights)
            localStorage.setItem('highlightedVerses', JSON.stringify(highlights))
        }
    } else {
        localStorage.setItem('highlightedVerses', JSON.stringify(options.highlights))
    }
    flash('Highlights imported')
    emits('importData')
}

const importPlans = (options) => {
    if (options.option === 'merge') {
        const plans = JSON.parse(localStorage.getItem('plans'))
        if (!plans) {
            localStorage.setItem('plans', JSON.stringify(options.plans))
        } else {
            highlights.push(...options.plans)
            localStorage.setItem('plans', JSON.stringify(plans))
        }
    } else {
        localStorage.setItem('plans', JSON.stringify(options.plans))
    }
    flash('Plans imported')
    emits('importData')
}

const downloadHistory = () => {
    var history = localStorage.getItem('history')
    if (!history) {
        flash('No history to download')
        return
    }
    history = {
        timestamp: new Date(),
        type: 'history',
        history: JSON.parse(history)
    }
    var filename =  `sharpsword-history-${new Date().toISOString()}.json`
    download(history, filename)
}

const downloadHighlights = () => {
    var highlights = localStorage.getItem('highlightedVerses')
    if (!highlights) {
        flash('No highlights to download')
        return
    }
    highlights = {
        timestamp: new Date(),
        type: 'highlight',
        highlights: JSON.parse(highlights)
    }
    var filename =  `sharpsword-highlights-${new Date().toISOString()}.json`
    download(highlights, filename)
}

const downloadPlans = () => {
    var plans = localStorage.getItem('plans')
    if (!plans) {
        flash('No plans to download')
        return
    }
    plans = {
        timestamp: new Date(),
        type: 'plan',
        plans: JSON.parse(plans)
    }
    var filename =  `sharpsword-plans-${new Date().toISOString()}.json`
    download(plans, filename)
}

const download = (data, filename) => {
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
}

const displayFontSize = (size) => {
    const sizes = {
        'verse-text-xs': 'XS',
        'verse-text-sm': 'SM',
        'verse-text-base': 'MD',
        'verse-text-lg': 'LG',
        'verse-text-xl': 'XL',
        'verse-text-2xl': '2XL'
    }
    return sizes[size]
}

const displayLineHeight = (size) => {
    const sizes = {
        'verse-leading-none': 'None',
        'verse-leading-tight': 'Tight',
        'verse-leading-snug': 'Snug',
        'verse-leading-normal': 'Normal',
        'verse-leading-loose': 'Loose',
        'verse-leading-9': 'Very Loose',
        'verse-leading-10': 'Huge'
    }
    return sizes[size]
}

const increaseFontSize = () => {
    const sizes = ['verse-text-xs', 'verse-text-sm', 'verse-text-base', 'verse-text-lg', 'verse-text-xl', 'verse-text-2xl']
    const index = sizes.indexOf(store.fontSize)
    if (index < sizes.length - 1) {
        store.fontSize = sizes[index + 1]
        localStorage.setItem('fontSize', store.fontSize)
    }
}

const decreaseFontSize = () => {
    const sizes = ['verse-text-xs', 'verse-text-sm', 'verse-text-base', 'verse-text-lg', 'verse-text-xl', 'verse-text-2xl']
    const index = sizes.indexOf(store.fontSize)
    if (index > 0) {
        store.fontSize = sizes[index - 1]
        localStorage.setItem('fontSize', store.fontSize)
    }
}

const increaseLineHeight = () => {
    const sizes = ['verse-leading-none', 'verse-leading-tight', 'verse-leading-snug', 'verse-leading-normal', 'verse-leading-loose', 'verse-leading-9', 'verse-leading-10']
    const index = sizes.indexOf(store.lineHeight)
    if (index < sizes.length - 1) {
        store.lineHeight = sizes[index + 1]
        localStorage.setItem('lineHeight', store.lineHeight)
    }
}

const decreaseLineHeight = () => {
    const sizes = ['verse-leading-none', 'verse-leading-tight', 'verse-leading-snug', 'verse-leading-normal', 'verse-leading-loose', 'verse-leading-9', 'verse-leading-10']
    const index = sizes.indexOf(store.lineHeight)
    if (index > 0) {
        store.lineHeight = sizes[index - 1]
        localStorage.setItem('lineHeight', store.lineHeight)
    }
}


</script>
