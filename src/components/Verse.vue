<template>
    <div v-if="verse.D" class="w-full italic flex justify-center text-lg mb-4">
        {{ verse.D }}
    </div>
    <div class="verse-container cursor-pointer" 
        style="scroll-margin: 30rem 0;"
        :id="verse.ID"
        @click="selectVerse(verse.ID)"
        :class="[fontSize, lineHeight, selected ? 'selected' : '', presented ? 'presented': '', highlighted]" v-html="verse.T">
    </div>
    <div v-if="verse.H" class="mt-6">
        <span class="italic text-2xl text-slate-600">{{ verse.H }}</span>
    </div>
    <span v-if="verse.P && index > 0" class="text-slate-800 -mb-[30px] mt-[20px] -ml-1" >
        ¶
    </span>
</template>

<script setup>
import { ref } from 'vue'

const emits = defineEmits(['selectVerse'])

const selectVerse = (verse_id) => {
    emits('selectVerse', verse_id)
}

const props = defineProps({
    verse: Object,
    key: Number,
    index: Number,
    selected: {
        type: Boolean,
        default: false
    },
    presented: {
        type: Boolean,
        default: false
    },
    highlighted: {
        type: String,
        default: ''
    },
    fontSize: {
        type: String,
        default: 'verse-text-xl'
    },
    lineHeight: {
        type: String,
        default: 'verse-leading-loose'
    }
})

</script>
<style scoped>
.yellow :deep(.content) {
    background-color: #ffe00045;
}
.red :deep(.content) {
    background-color: #922a2aba;
}
.blue :deep(.content) {
    background-color: #275fa5ab;
}
.lime :deep(.content) {
    background-color: #87bc2599;
}
.violet :deep(.content) {
    background-color: #664dd9c2;
}
/*
 * Glow behind the verse a search or link jumped to. It is a gradient painted
 * once and faded with opacity, which the compositor animates without
 * repainting; a blurred text-shadow had to be re-rasterized per glyph on
 * every frame and dropped scrolling to ~18 fps.
 */
.verse-container {
    position: relative;
    isolation: isolate;
}
.verse-container::before {
    content: '';
    position: absolute;
    /* no wider than the reading area's side padding (px-6), or phones scroll sideways */
    inset: -1.5em -1.5rem;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(closest-side, #ff4da666, #ff4da626 55%, transparent);
    opacity: 0;
    /* slow fade out once the highlight ends */
    transition: opacity 3s ease-in-out;
}
.presented::before {
    opacity: 1;
    /* quick fade in when landing on the verse */
    transition: opacity 0.6s ease;
}

.selected :deep(.content)  {
    text-decoration: dotted;
    text-decoration-line: underline;
    text-underline-offset: 7px;
    text-decoration-color: #ffffff82;
    transition: all 0.3s ease;
}
.verse-container :deep(.label) {
    vertical-align: top;
    font-size: 0.8em;
    margin-left: 1.2em;
    margin-right: 0.4em;
    color: #9ca3af;
}
.verse-text-2xl {
    font-size: 1.5rem; /* 24px */
}
.verse-text-xl {
    font-size: 1.25rem; /* 20px */
}
.verse-text-lg {
    font-size: 1.125rem; /* 18px */
}
.verse-text-base {
    font-size: 1rem; /* 16px */
}
.verse-text-sm {
    font-size: 0.875rem; /* 14px */
}
.verse-text-xs {
    font-size: 0.75rem; /* 12px */
}
.verse-leading-none {
	line-height: 1;
}
.verse-leading-tight {
    line-height: 1.25;
}
.verse-leading-snug {
    line-height: 1.375;
}
.verse-leading-normal {
    line-height: 1.5;
}
.verse-leading-relaxed {
    line-height: 1.625;
}
.verse-leading-loose {
    line-height: 2;
}
.verse-leading-9 {
    line-height: 2.25;
}
.verse-leading-10 {
    line-height: 2.5;;
}
.verse-container :deep(:nth-child(n + 2 of .verse)) {
    margin-left: 0.8em;
}
.verse-container :deep(.nd) {
    text-transform: uppercase;
}
.verse-container :deep(.add) {
    font-style: italic;
}
.verse-container :deep(.wj) {
    color: #e17777;
}
.verse-container :deep(.verse) {
    display:block;
}


</style>
