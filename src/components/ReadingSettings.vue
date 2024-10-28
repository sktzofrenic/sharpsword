<template>
    <div class="absolute z-10 w-[90vw] right-6 sm:w-[20vw] top-20">
        <div class="px-4 py-2 bg-slate-800 border-b border-slate-600 rounded-lg shadow-slate-900 shadow-xl">
            <h3 class="font-semibold text-slate-100">Reading Settings</h3>
            <div class="text-slate-100 mb-2">
                <div class="flex justify-between items-center mt-4 bg-slate-900 px-4 py-2 rounded-lg">
                    <button @click="decreaseFontSize" class="text-slate-100 disabled:text-slate-600" :disabled="displayFontSize(store.fontSize) === 'XS'">
                        <i class="fa-solid fa-minus text-xl"></i>
                    </button>
                    <span class="text-slate-400">Font Size: 
                        <span class="text-slate-100">{{displayFontSize(store.fontSize)}}</span>
                    </span>
                    <button @click="increaseFontSize" class="text-slate-100 disabled:text-slate-600" :disabled="displayFontSize(store.fontSize) === '2XL'">
                        <i class="fa-solid fa-plus text-xl"></i>
                    </button>
                </div>
                <div class="flex justify-between items-center mt-4 bg-slate-900 px-4 py-2 rounded-lg">
                    <button @click="decreaseLineHeight" class="text-slate-100 disabled:text-slate-600" :disabled="displayLineHeight(store.lineHeight) === 'None'">
                        <i class="fa-solid fa-minus text-xl"></i>
                    </button>
                    <span class="text-slate-400">
                        Line Height: 
                        <span class="text-slate-100">{{displayLineHeight(store.lineHeight)}}</span>
                    </span>
                    <button @click="increaseLineHeight" 
                        class="text-slate-100 disabled:text-slate-600" 
                        :disabled="displayLineHeight(store.lineHeight) === 'Huge'">
                        <i class="fa-solid fa-plus text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/stores/appStore.js'

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
