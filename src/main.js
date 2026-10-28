import './assets/output.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Bible from './Bible.vue'
import { requestPersistentStorage } from './assets/js/offline.js'

requestPersistentStorage()

const app = createApp(Bible)

app.use(createPinia())

app.mount('#app')
