
const sharpSword = "sharp-sword-v1"
const assets = [
    "/",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(sharpSword).then(cache => {
            cache.addAll(assets)
        })
    )
})
