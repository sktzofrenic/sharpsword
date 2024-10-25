import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
    const theme = ref('dark')

    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    const logout = () => {
        console.log('logout')
    }

    return { 
        theme
    }
})

