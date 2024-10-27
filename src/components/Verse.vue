<template>
    <div v-if="verse.D" class="w-full italic flex justify-center text-lg mb-4">
        {{ verse.D }}
    </div>
    <div class="verse-container" :class="[fontSize, lineHeight]" v-html="verse.T"></div>
    <div v-if="verse.H" class="mt-6">
        <span class="italic text-2xl text-slate-600">{{ verse.H }}</span>
    </div>
    <span v-if="verse.P && index > 0" class="text-slate-800 -mb-[30px] mt-[20px] -ml-1" >¶</span>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    verse: Object,
    key: Number,
    index: Number,
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
.verse-container :deep(:nth-child(n + 2 of .verse)) {
    margin-left: 0.8em;
}
.verse-container :deep(.nd) {
    transform: uppercase;
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
