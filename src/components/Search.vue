<template>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!--
Background backdrop, show/hide based on modal state.

Entering: "ease-out duration-300"
From: "opacity-0"
To: "opacity-100"
Leaving: "ease-in duration-200"
From: "opacity-100"
To: "opacity-0"
-->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <!--
Modal panel, show/hide based on modal state.

Entering: "ease-out duration-300"
From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
To: "opacity-100 translate-y-0 sm:scale-100"
Leaving: "ease-in duration-200"
From: "opacity-100 translate-y-0 sm:scale-100"
To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
-->
                <div class="relative transform overflow-hidden rounded-lg bg-slate-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6">
                    <div class="absolute right-0 top-0 pr-4 pt-4">
                        <button type="button" class="rounded-md bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="close">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-slate-100 mb-2">Search</div>
                    <div class="sm:flex sm:items-start">
                        <div class="text-center">
                            <div class="mb-2">
                                <div class="relative">
                                    <input type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 max-h-[75vh] overflow-y-auto pr-2">
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Genesis</div>
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Exodus</div>
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Leveticus</div>
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Numbers</div>
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Deuteronomy</div>
                        <div class="text-slate-100 px-2 py-1 bg-slate-800 rounded-md">Genesis</div>
                    </div>

                    <div class=" sm:mt-4 sm:flex sm:flex-row-reverse">
                        
                        <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 sm:mt-0 sm:w-auto" @click="close">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const emits = defineEmits(['close'])

const close = () => {
    emits('close')
}



</script>
