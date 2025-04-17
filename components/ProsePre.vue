<script setup lang="ts">
const props = defineProps({
    code: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'plaintext'
    },
    filename: {
        type: String,
        default: null
    },
    highlights: {
        type: Array as () => number[],
        default: () => []
    },
    meta: {
        type: String,
        default: null
    },
    class: {
        type: String,
        default: null
    }
})

const copied = ref<boolean>(false)

const writeClipboardText = async () => {
    if (copied.value) {
        return
    }
    try {
        await navigator.clipboard.writeText(props.code)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 1500)
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <div class="bg-gray-700 dark:bg-gray-800 rounded-xl p-2 my-2">
        <div class="text-gray-200 text-md mb-2 px-1 font-bold flex justify-between">
            <span>{{ language.toUpperCase() }}</span>
            <button class="p-1" @click="writeClipboardText">
                <uno-icon v-if="copied" class="i-bi:check2" style="width: 1rem; height: 1rem" />
                <uno-icon v-else class="i-bi:clipboard" style="width: 1rem; height: 1rem" />
            </button>
        </div>
        <pre style="margin-top: 0; margin-bottom: 0" :class="props.class"><slot /></pre>
    </div>
</template>
<style scoped></style>
