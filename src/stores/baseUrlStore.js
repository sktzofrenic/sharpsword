import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBaseUrlStore = defineStore('baseUrl', () => {
  const baseUrl = ref(location.hostname === "localhost" ? `http://127.0.0.1:3000` : `${location.protocol}//${location.hostname}`)

  return { baseUrl }
})

