<template>
    <div class="my-2 px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-xl transition-colors">
        <h3 role="button" :class="'flex justify-between text-lg py-2 px-2 -mx-2 sticky top-0 ' + (expand ? 'bg-gray-200 dark:bg-gray-800' : '')" @click="expand = !expand">
            <div>
                <slot>Expand</slot>
            </div>

            <div role="button" class="rounded-full h-4 text-gray-900 dark:text-gray-100 transition-colors size-5 my-1" title="Expand list" aria-label="Expand list">
                <uno-icon v-if="expand" class="i-bi:arrows-collapse" />
                <uno-icon v-else class="i-bi:arrows-expand" />
            </div>
        </h3>
        <div :class="{ 'list-in': expand, 'list-out': !expand, 'mb-3': expand }" :style="{ 'max-height': expand ? undefined : 0 }">
            <hr class="border-gray-400 dark:border-gray-600 my-1" />
            <slot name="container">Nothing here~</slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const expand = ref<boolean>(false)
</script>
