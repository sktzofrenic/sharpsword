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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'

const emits = defineEmits(['close'])

const close = () => {
    emits('close')
}

const store = useAppStore()

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
