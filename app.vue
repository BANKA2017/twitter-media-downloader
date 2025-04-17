<template>
    <NuxtLayout name="twmedia">
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
const colorScheme = ref<string>('normal')

useHead({
    htmlAttrs: {
        lang: 'en'
    },
    script: [
        {
            innerHTML: `d=localStorage.darkMode||'0';c=document.documentElement.classList;v=c.value==='';if((d==='0'&&matchMedia('(prefers-color-scheme:dark)').matches&&v)||(d==='2'&&v)){c.add('dark')}`
        }
    ],
    meta: [
        { name: 'color-scheme', content: colorScheme.value },
        { name: 'description', content: 'Download tweet media in one site' }
    ]
})

const store = useMainStore()

onMounted(() => {
    store.updateSize()
    window.addEventListener('resize', store.updateSize)
    colorScheme.value = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'normal'
})

onUnmounted(() => {
    window.removeEventListener('resize', store.updateSize)
})
</script>

<style scoped></style>
