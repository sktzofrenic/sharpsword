<template>
    <div v-if="verse.D" class="w-full italic flex justify-center text-lg">
        {{ verse.D }}
    </div>
    <div class="verse-container" v-html="verse.T"></div>
    <span v-if="verse.P" class="text-slate-800 -mb-[30px] mt-[20px]" >¶</span>
    <div v-if="verse.H" class="mb-2">
        <span class="italic text-2xl text-slate-600">{{ verse.H }}</span>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
    verse: Object
})

</script>
<style scoped>
.verse-container :deep(.label) {
    vertical-align: top;
    font-size: 0.8em;
    margin-left: 1.2em;
    margin-right: -0.6em;
    color: #9ca3af;
}
.verse-container :deep(:nth-child(1 of span.content)) {
    margin-left: 0.8em;
}
.verse-container :deep(.nd) {
    transform: uppercase;
    margin-left: -0.8em;
}
.verse-container :deep(.add){
    font-style: italic;
    margin-left: -0.8em;
}
.verse-container {
}


</style>
