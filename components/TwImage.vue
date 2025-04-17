<template>
    <div id="tweet-image">
        <div :class="'grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl ' + (realList.length > 1 ? 'aspect-video' : 'max-h-[50vh]')">
            <div
                v-for="(media, index) in realList"
                :key="index"
                :class="
                    'bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden ' +
                    (realList.length === 1 ? 'col-span-2 ' : ' ') +
                    (realList.length === 2 || (realList.length === 3 && index === 0) ? 'row-start-1 ' : ' ') +
                    (realList.length === 2 || (realList.length === 3 && index === 0) ? 'row-end-3' : '')
                "
            >
                <video
                    v-if="media.content_type.startsWith('video') && media.url"
                    :class="'w-full h-[100%] rounded-xl ' + (realList.length >= 3 && index !== 0 && !fullMedia ? 'aspect-video' : '')"
                    :src="PUBLIC_BASEPATH + '/media/proxy/' + media.url"
                    controls
                    preload="metadata"
                ></video>
                <img
                    v-else-if="!media.content_type.startsWith('video')"
                    :alt="media.basename"
                    :class="'w-full object-cover h-[100%] rounded-xl ' + (realList.length >= 3 && index !== 0 && !fullMedia ? 'aspect-video' : '')"
                    :src="PUBLIC_BASEPATH + '/media/proxy/' + media.url"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    list: Array,
    aspect_ratio: String
})

const realList = ref<any[]>([])
const fullMedia = ref(true)

const flexibleMode = { value: false }

const runtimeConfig = useRuntimeConfig()
const PUBLIC_BASEPATH = runtimeConfig.public.NUXT_BASE_PATH

onMounted(() => {
    let tmpNameList: string[] = []
    let tmpList: any[] = []
    props.list?.forEach((x) => {
        if (!tmpNameList.includes(x.filename)) {
            tmpNameList.push(x.filename)
            tmpList.push(x)
        }
    })
    const tmpRealList = []
    for (let media of tmpList) {
        tmpRealList.push(media)
    }
    realList.value = tmpRealList
})
</script>
