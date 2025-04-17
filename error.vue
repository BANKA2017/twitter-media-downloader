<template>
    <NuxtLayout name="twmedia">
        <h1 class="text-6xl mb-5 mt-3">{{ code }}</h1>
        <p class="text-xl"><SvgNothing width="1em" height="1em" class="inline-block" /> {{ errorMessage[code] ? errorMessage[code] : 'What? ' }} back to <NuxtLink to="/" class="mx-1 underline underline-offset-4">main page</NuxtLink> plz~</p>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { NuxtError } from '@nuxt/types'
const props = defineProps({
    error: {
        type: Object as PropType<NuxtError>,
        default: { statusCode: 404 }
    }
})

const code = ref<number>(props.error.statusCode || 500)

useHead({
    script: [
        {
            // innerHTML: `d=localStorage.darkMode||'0';c=document.documentElement.classList;v=c.value==='';if((d==='0'&&matchMedia('(prefers-color-scheme:dark)').matches&&v)||(d==='2'&&v)){c.add('dark')}`
            innerHTML: `c=document.documentElement.classList;v=c.value==='';if(v){c.add('dark')}`
        }
    ]
})

const errorMessage = {
    302: 'Loading……',
    404: 'No such page',
    500: 'Crash'
}
</script>
