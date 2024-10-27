import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
    const theme = ref('dark')
    const lineHeight = ref('verse-leading-loose')
    const fontSize = ref('verse-text-xl')

    // update lineHeight and fontSize from local storage if found
    const localLineHeight = localStorage.getItem('lineHeight')
    const localFontSize = localStorage.getItem('fontSize')

    if (localLineHeight) lineHeight.value = localLineHeight
    if (localFontSize) fontSize.value = localFontSize

    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    const logout = () => {
        console.log('logout')
    }

    return { 
        theme,
        lineHeight,
        fontSize
    }
})

