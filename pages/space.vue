<template>
    <div v-if="loadingStatus" class="flex justify-center">
        <loading-card v-if="loadingStatus === 'error'">Invalid space id #{{ searchParams.id }}, back to <a href="/" class="dark:decoradetion-sky-300 decoration-sky-400 underline-offset-4 underline">main page</a>...</loading-card>
        <loading-card v-else-if="loadingStatus !== 'error'">loading space {{ loadingStatus }} #{{ searchParams.id }}...</loading-card>
    </div>
    <template v-else-if="!loadingStatus && spaceInfo?.data?.id">
        <div class="flex justify-between mb-2">
            <h4 class="text-2xl font-bold">{{ spaceInfo.data.title }}</h4>
            <a :href="'https://twitter.com/i/spaces/' + spaceInfo.data.id" target="_blank" class="inline-block mr-1 text-sm border-2 border-[#9C63FA] rounded-full max-w-[15em] h-6"
                ><span class="bg-[#9C63FA] px-2 rounded-full text-white">Space</span><span class="text-black dark:text-white px-2">{{ spaceInfo.data.total }}</span></a
            >
        </div>
        <div class="font-light">
            <span>Since {{ getDate(Number(spaceInfo.data.start)) }}</span>
            ·
            <span class="px-2 text-sm">{{ spaceInfo.data.state }}</span>
            ·
            <a :href="`https://twitter.com/${spaceInfo.data.name}`" target="_blank" class="px-2 text-sm underline underline-offset-2 decoration-sky-500">
                <img class="h-[1rem] w-[1rem] bg-gray-500 rounded-full inline-block" :src="PUBLIC_BASEPATH + '/media/proxy/' + spaceInfo.data.avatar.replace(/http(?:s|):\/\//g, '')" :alt="spaceInfo.data.display_name" />
                {{ spaceInfo.data.display_name }}
            </a>
            <modal class="bottom-5 p-3 inline-block" title="Download">
                <template v-slot:default>
                    <button class="rounded hover:bg-sky-500 dark:hover:bg-sky-500 px-3 py-1 inline-block transition-colors">Donwload</button>
                </template>
                <template v-slot:container>
                    <div class="gap-3 mb-3 transition-colors">
                        <button
                            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full px-3 py-1 mx-1"
                            @click="
                                () => {
                                    Download(`data:text/plain;charset=utf-8,${JSON.stringify(spaceInfo.data)}`, `${spaceInfo.data.title.replaceAll(' ', '_')}_${spaceInfo.data.id}_space_info.json`)
                                }
                            "
                        >
                            Space info
                        </button>
                        <button
                            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full px-3 py-1 mx-1"
                            @click="
                                () => {
                                    Download(`data:text/plain;charset=utf-8,${JSON.stringify(frameInfoList)}`, `${spaceInfo.data.title.replaceAll(' ', '_')}_${spaceInfo.data.id}_frame_info.json`)
                                }
                            "
                        >
                            Frame info
                        </button>
                        <button
                            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full px-3 py-1 mx-1"
                            @click="
                                () => {
                                    Download(`data:text/plain;charset=utf-8,${encodeURIComponent(m3u8Str)}`, `${spaceInfo.data.title.replaceAll(' ', '_')}_${spaceInfo.data.id}_m3u8.m3u8`)
                                }
                            "
                        >
                            M3U8
                        </button>
                        <button
                            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full px-3 py-1 mx-1"
                            @click="
                                () => {
                                    Download(src, `${spaceInfo.data.title.replaceAll(' ', '_')}_${spaceInfo.data.id}_audio.aac`)
                                }
                            "
                        >
                            Audio
                        </button>
                    </div>
                </template>
            </modal>
        </div>
        <div :class="'h-8 w-full text-center relative ' + (percent >= 100 && src ? 'hidden' : 'inline-block')">
            <span class="absolute py-1 -translate-x-1/2 text-current">{{ count + indexPrefix }} / {{ metaData?.manifest?.segments?.length || 0 }}</span>
            <div class="h-full bg-sky-500 rounded-xl" :style="`width: ${percent}%;`"></div>
        </div>
        <div v-show="src">
            <audio :src="src" controls class="w-full mb-3" ref="audio_controller"></audio>
            <div class="grid grid-cols-3 md:grid-col-4 lg:grid-cols-6 gap-2">
                <a
                    v-for="(user, index) in participants"
                    :key="index"
                    class="col-span-1 p-2 rounded-xl hover:text-white hover:bg-sky-500 dark:hover:bg-sky-800 transition-colors text-center"
                    :href="`https://twitter.com/${user.name || user.UserName}`"
                    target="_blank"
                >
                    <div class="flex justify-center w-full">
                        <div class="relative">
                            <div :class="'absolute rounded-full bg-sky-500 p-1 -right-1 -bottom-1 ' + (currentFrameInfo?.HydraAudioLevel?.[index] || 0 ? 'inline-block' : 'hidden')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-white" width="0.65rem" height="0.65rem" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
                                    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
                                </svg>
                            </div>
                            <img
                                class="rounded-full w-[50px] h-[50px] bg-gray-500"
                                :src="PUBLIC_BASEPATH + '/media/proxy/' + (user.avatar || user.ProfileUrl).replace('_normal.', '.').replace(/http(?:s|):\/\//g, '')"
                                :alt="user.display_name || user.UserName"
                            />
                        </div>
                    </div>
                    <span class="block font-bold">{{ user.display_name || user.UserName }}</span>
                </a>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
import { Parser } from 'm3u8-parser'
import { concatBuffer, type id3FrameParserType } from '~/share/Parser'
import { Download } from '~/share/Tools'

const runtimeConfig = useRuntimeConfig()
const PUBLIC_BASEPATH = runtimeConfig.public.NUXT_BASE_PATH

const metaData = ref({})
let m3u8Prefix = ''
const m3u8Str = ref<string>('')
const count = ref<number>(0)
const firstTimeCursor = ref<number>(0)

const indexPrefix = ref<number>(0)
const thread = 10

const src = ref<string>('')
const fetchChunkWorker = ref<Worker | null>(null)
const spaceInfo = ref({})
const completeList = ref<string[]>([])
const loadingStatus = ref<'info' | 'm3u8' | 'error' | ''>('info') //m3u8 //'' as done
const controller = ref<AbortController | null>(null)
const audio_controller = ref<Element>()

const auidoCurrentTimeListenerFunction = (e) => {
    audioCurrentTime.value = e.target?.currentTime || 0
}

const sourceOpen = async () => {
    count.value = 0
    for (const index in metaData.value.manifest.segments.slice(indexPrefix.value, thread + indexPrefix.value)) {
        const segment = metaData.value.manifest.segments[index]
        fetchChunkWorker.value?.postMessage({
            uri: PUBLIC_BASEPATH + '/media/proxy/' + m3u8Prefix + segment.uri,
            index: Number(index) + indexPrefix.value
        })
    }
}
const getDate = (timestamp: number = 0) => {
    const tmpDate = new Date(timestamp)
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Set', 'Oct', 'Nov', 'Dec']
    //4:22 PM · 19 Aug, 2022
    return `${tmpDate.getHours()}:${tmpDate.getMinutes().toString().padStart(2, '0')} · ${tmpDate.getDate()} ${monthName[tmpDate.getMonth()]}, ${tmpDate.getFullYear()}`
}

const getSpaceInfo = async (id) => {
    if (!id || !/^1[a-zA-Z]+$/g.test(id || '')) {
        loadingStatus.value = 'error'
        return
    }
    try {
        spaceInfo.value = await (
            await fetch(`${PUBLIC_BASEPATH}/online/api/v3/data/audiospace/?id=${id}`, {
                signal: controller.value?.signal
            })
        ).json()
        //console.log(spaceInfo);
        if (spaceInfo.value?.data?.playback) {
            m3u8Prefix = ((x) => x.host + x.pathname)(new URL(spaceInfo.value.data.playback)).split('/').slice(0, -1).join('/') + '/'
            loadingStatus.value = 'm3u8'
            await getM3U8(spaceInfo.value.data.playback)
        } else {
            loadingStatus.value = ''
        }
    } catch (e) {
        console.log(e)
    }
}

const getM3U8 = async (link: string) => {
    if (!link) {
        return
    }
    try {
        m3u8Str.value = await (
            await fetch(`${PUBLIC_BASEPATH}/media/proxy/${link.replace(/http(?:s):\/\//g, '')}`, {
                signal: controller.value?.signal
            })
        ).text()
        let m3u8Parser = new Parser()
        m3u8Parser.push(m3u8Str.value)
        m3u8Parser.end()
        metaData.value = m3u8Parser
        loadingStatus.value = ''
        await sourceOpen()
    } catch (e) {
        console.log(e)
    }
}

let bufferList: { [p in number]: Uint8Array } = {}
const anyUseScript = () => {
    //console.log(
    //    bufferList,
    //    bufferList.sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
    //);
    const aacBuffer = concatBuffer(
        Object.entries(bufferList)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map((buffer) => buffer[1])
    )

    if (audio_controller.value) {
        audio_controller.value?.addEventListener('timeupdate', auidoCurrentTimeListenerFunction)
    }

    src.value = URL.createObjectURL(new Blob([aacBuffer], { type: 'audio/aac' }))
    frameInfoList.value = frameInfoList.value
        .map((frame) => frame.filter((frameItem) => ['TIT3', 'TXXX'].includes(frameItem[0])))
        .filter((x) => x.length > 0)
        .map((x) => Object.fromEntries(x.map((y) => [y[0] === 'TIT3' ? 'currentTime' : y[3][0], y[0] === 'TIT3' ? Number(y[3]) : y[3][1]])))
        .filter((x) => x.currentTime)
        .sort((a, b) => a.currentTime - b.currentTime)
    if (firstTimeCursor.value === 0 && frameInfoList.value.length > 0) {
        firstTimeCursor.value = Number(frameInfoList.value[0].currentTime)
    }
    //console.log(frameInfoList);
}

const frameInfoList = ref<id3FrameParserType[]>([])
const audioCurrentTime = ref<number>(0)
onMounted(() => {
    searchParams.value = Object.fromEntries([...new URLSearchParams(window.location.search)])
    controller.value = new AbortController()

    fetchChunkWorker.value = new Worker(new URL('~/assets/workers/FetchChunkWorker', import.meta.url), {
        type: 'module'
    })
    fetchChunkWorker.value.onmessage = (e: { data: { uri: string; index: number; bufferList: Uint8Array; frameInfoList: id3FrameParserType[]; err: unknown | null } }) => {
        // TODO retry
        // if (e.data.err) {
        //     return
        // }

        bufferList[e.data.index] = e.data.bufferList
        frameInfoList.value = frameInfoList.value.concat(e.data.frameInfoList)
        completeList.value = completeList.value.concat([e.data.uri])
        count.value++
        //console.log(e)
        //console.log(
        //    e.data.index,
        //    e.data.index + thread,
        //    metaData.manifest.segments[e.data.index + thread]?.uri
        //);
        if (!controller.value?.aborted && metaData.value.manifest.segments[e.data.index + thread]?.uri) {
            fetchChunkWorker.value?.postMessage({
                uri: PUBLIC_BASEPATH + '/media/proxy/' + m3u8Prefix + metaData.value.manifest.segments[e.data.index + thread].uri,
                index: e.data.index + thread
            })
        }
    }
    fetchChunkWorker.value.onerror = (e) => {
        console.log(e)
    }
    getSpaceInfo(searchParams.value.id)
})
const percent = computed(() => ((count.value + indexPrefix.value) / (metaData.value?.manifest?.segments?.length || 0)) * 100)
const currentFrameInfo = computed(() => frameInfoList.value.find((x) => x.currentTime > firstTimeCursor.value + audioCurrentTime.value) || {})
const participants = computed(() => [...(spaceInfo.value?.data?.admins || []), ...(currentFrameInfo.value?.HydraParticipants || []).map((user) => spaceInfo.value.data.speakers.find((x) => x.name === user.UserName) || user)])
watch(completeList, () => {
    //console.log(
    //    completeList.length,
    //    indexPrefix,
    //    metaData?.manifest?.segments?.length || 0
    //);
    if (metaData.value && completeList.value.length + indexPrefix.value >= (metaData.value?.manifest?.segments?.length || 0)) {
        anyUseScript()
    }
})

const searchParams = ref({})

onBeforeUnmount(() => {
    fetchChunkWorker.value?.terminate()
    controller.value?.abort()
    audio_controller.value?.removeEventListener('timeupdate', auidoCurrentTimeListenerFunction)
})

useHead({
    title: 'Space'
})
</script>
