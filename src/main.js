import './assets/output.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Bible from './Bible.vue'
import { requestPersistentStorage } from './assets/js/offline.js'
import { initUserData } from './stores/userDataStore.js'
import { useSyncStore } from './stores/syncStore.js'

requestPersistentStorage()

const app = createApp(Bible)

app.use(createPinia())

initUserData()
useSyncStore().start()

app.mount('#app')
