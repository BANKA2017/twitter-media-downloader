<template>
    <div class="w-full">
        <div class="flex justify-center">
            <template v-if="!mediaData.code">
                <loading-card v-if="loadingStatus === 'error'">Invalid tweet id #{{ searchParams.id }}, back to <a href="/" class="dark:decoradetion-sky-300 decoration-sky-400 underline-offset-4 underline">main page</a>...</loading-card>
                <loading-card v-else>loading tweet {{ loadingStatus }} #{{ searchParams.id }}...</loading-card>
            </template>
            <div v-if="mediaData.code === 200" class="max-w-[40rem]">
                <tw-image :list="mediaData.data.media_info" />
                <div class="list-group my-2">
                    <template v-for="(mediaInfo, mediaOrder) in mediaData.data.media_info" :key="mediaOrder">
                        <a
                            v-if="mediaInfo.original_type !== 'video'"
                            :href="PUBLIC_BASEPATH + '/media/proxy/' + `${mediaInfo.url}:orig`"
                            target="_blank"
                            class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-between px-4 py-2 mb-2"
                        >
                            {{ mediaInfo.basename }}
                            <div class="gap-2">
                                <span class="text-white px-2 rounded-full bg-sky-500">{{ mediaInfo.original_info_height + 'x' + mediaInfo.original_info_width }}</span>
                                <span class="text-white px-2 rounded-full bg-green-500">{{ mediaOrder + 1 }}</span>
                            </div>
                        </a>
                        <template v-if="mediaInfo.original_type === 'video'">
                            <a
                                v-for="(video, order) in (mediaData.data.video_info[videoIndexList.indexOf(mediaOrder)]?.variants || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))"
                                :key="order"
                                :href="PUBLIC_BASEPATH + '/media/proxy/' + mediaInfo.url"
                                target="_blank"
                                class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-between px-4 py-2 mb-2"
                            >
                                {{ video.url.replace(/.*\/(.*)\.(?:mp4|m3u8).*/, `$1`) }}
                                <div class="gap-2">
                                    <span v-if="video.content_type === 'video/mp4'" class="text-white px-2 rounded-full bg-pink-500">{{ video.bitrate / 1000 + ' kbps' }}</span>
                                    <span class="text-white px-2 rounded-full bg-sky-500">{{ video.content_type === 'video/mp4' ? video.url.replace(/.*\/(\d+x\d+)\/.*/, `$1`) : `m3u8` }}</span>
                                    <span class="text-white px-2 rounded-full bg-green-500">{{ mediaOrder + 1 }}</span>
                                </div>
                            </a>
                        </template>
                    </template>
                </div>
                <prose-pre language="json" :code="JSON.stringify(mediaData.data, null, 4)" filename="meta data">
                    <div class="overflow-x-scroll">
                        {{ JSON.stringify(mediaData.data, null, 4) }}
                    </div>
                </prose-pre>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
const PUBLIC_BASEPATH = runtimeConfig.public.NUXT_BASE_PATH

const loadingStatus = ref<'info' | 'error' | ''>('info') //m3u8 //'' as done
const mediaData = ref({})

const getMedia = async (id) => {
    if (isNaN(Number(id))) {
        loadingStatus.value = 'error'
        return
    }

    const tmpMediaData = await (await fetch(`${PUBLIC_BASEPATH}/online/api/v3/data/media/?tweet_id=${id}`)).json()
    if (tmpMediaData?.data?.card_info?.type === 'audiospace') {
        navigateTo(`/space?id=${tmpMediaData?.data?.card_info?.id}`)
    } else {
        mediaData.value = tmpMediaData
    }
}

onMounted(async () => {
    searchParams.value = Object.fromEntries([...new URLSearchParams(window.location.search)])
    if (searchParams.value?.id) {
        await getMedia(searchParams.value.id)
    }
})

const searchParams = ref({})
const videoIndexList = computed(() => {
    let tmpVideoIndexList = []
    for (const mediaIndex in mediaData.value?.data?.media_info || []) {
        if (mediaList[mediaIndex].content_type === 'video/mp4') {
            tmpVideoIndexList = tmpVideoIndexList.concat([Number(mediaIndex)])
        }
    }
    return tmpVideoIndexList
})
//TODO download meta data

useHead({
    title: 'Tweet'
})
</script>
