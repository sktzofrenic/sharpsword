import './assets/output.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Bible from './Bible.vue'

const worker = new Worker(new URL('./assets/js/service-worker.js', import.meta.url))

const app = createApp(Bible)

app.use(createPinia())

app.mount('#app')
