<script lang="ts" setup>
import { reactive } from 'vue'
import { useMainStore } from '~/stores/main'

const store = useMainStore()
const runtimeConfig = useRuntimeConfig()
const showList = ref<boolean>(false)

const route = useRoute()
const state = reactive<{
    navs: { name: string; to: string; routeName: string; active: boolean; show: boolean; plugin_name_backend?: string; sort: number }[]
}>({
    navs: [
        { name: 'Index', to: '/', routeName: 'index', active: true, show: true, sort: 0 },
        { name: 'About', to: '/about', routeName: 'about', active: true, show: true, sort: 1 }
    ]
})

const wholeRouteName = computed(() => state.navs.map((x) => x.routeName))
const activeNavs = computed(() => state.navs.filter((x) => x.active))
</script>

<template>
    <div id="side-list" class="select-none">
        <ClientOnly>
            <div class="md:hidden">
                <template v-for="nav in activeNavs" :key="nav.routeName">
                    <NuxtLink
                        :class="{
                            block: true,
                            'px-5': true,
                            'mx-1': true,
                            'md:-mx-5': true,
                            'rounded-full': true,
                            'transition-colors': true,
                            'hover:bg-sky-500': true,
                            'bg-sky-500': route.name === nav.routeName,
                            'text-black': route.name !== nav.routeName,
                            'hover:text-gray-100': true,
                            'dark:text-gray-100': true,
                            'text-gray-100': route.name === nav.routeName,
                            'sidelist-in': showList && route.name !== nav.routeName,
                            'sidelist-out': !showList && route.name !== nav.routeName
                        }"
                        :to="nav.to"
                        @click="showList = !showList"
                    >
                        <div class="py-2 my-1 flex justify-between gap-2">
                            <span class="inline-bolck truncate max-w-[60%] 3xs:max-w-[80%]">{{ nav.name }}</span>
                            <uno-icon class="i-bi:list" style="height: 1.5rem; width: 1.5rem" v-show="!showList && route.name === nav.routeName" />
                        </div>
                    </NuxtLink>
                </template>
            </div>
            <div class="hidden md:block" v-for="nav in activeNavs" :key="nav.routeName">
                <NuxtLink
                    :class="{
                        'max-w-full': true,
                        'inline-block': true,
                        'my-1': true,
                        'px-5': true,
                        'mx-1': true,
                        'md:-mx-5': true,
                        'rounded-full': true,
                        'transition-colors': true,
                        'hover:bg-sky-500': true,
                        'bg-sky-500': route.name === nav.routeName,
                        'text-black': route.name !== nav.routeName,
                        'hover:text-gray-100': true,
                        'dark:text-gray-100': true,
                        'text-gray-100': route.name === nav.routeName,
                        'py-2': true
                    }"
                    :to="nav.to"
                >
                    <div class="inline-bolck truncate">{{ nav.name }}</div>
                </NuxtLink>
            </div>
        </ClientOnly>
    </div>
</template>

<style scoped>
.sidelist-out {
    max-height: 0;
    opacity: 0;
    transition:
        max-height 0.1s ease-out,
        opacity 0.1s ease-out;
    overflow: hidden;
}

.sidelist-in {
    max-height: 2.5rem;
    opacity: 1;
    transition:
        max-height 0.1s ease-in,
        opacity 0.1s ease-in;
    overflow: hidden;
}
</style>
