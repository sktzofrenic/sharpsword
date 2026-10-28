import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { BIBLE_CACHE } from './src/assets/js/offline.js'

// Workbox copies these matchers into sw.js as source, so each must be self-contained.
// Search runs in Postgres, and the whole-Bible download is split into chapters by the app.
const isNetworkOnly = ({ url }) => url.pathname.startsWith('/api/v1/bible/') && /\/(search|all)$/.test(url.pathname)
const isBibleText = ({ url }) => url.pathname.startsWith('/api/v1/bible/') && !/\/(search|all)$/.test(url.pathname)
const isFontAwesome = ({ url }) => url.hostname.endsWith('fontawesome.com')

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            // show a "new version" prompt instead of swapping code under an open tab
            registerType: 'prompt',
            injectRegister: false,
            // install icons are fetched by the browser when installing, not by the app
            includeManifestIcons: false,
            manifest: {
                id: 'https://sharpsword.io',
                name: 'Sharp Sword',
                short_name: 'Sharp Sword',
                description: 'Bible App with Fast Search',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                dir: 'auto',
                lang: 'en-US',
                theme_color: '#020617',
                background_color: '#020617',
                icons: [
                    { src: '/icon512_maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                    { src: '/icon512_rounded.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                ],
            },
            workbox: {
                // app shell, including the lazily loaded reading plans
                globPatterns: ['**/*.{js,css,html,png}'],
                globIgnores: ['icon512_*.png'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        // every chapter someone reads stays available offline
                        urlPattern: isBibleText,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            // "Save for offline" writes chapters into this cache too
                            cacheName: BIBLE_CACHE,
                            expiration: { maxEntries: 1300 },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                    {
                        urlPattern: isNetworkOnly,
                        handler: 'NetworkOnly',
                    },
                    {
                        // the Font Awesome kit script, its CSS and fonts
                        urlPattern: isFontAwesome,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'font-awesome',
                            expiration: { maxEntries: 50 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // build output goes to public/ (served by the Go server), so static files live in static/
    publicDir: 'static',
    build: {
        outDir: 'public/'
    }
})
