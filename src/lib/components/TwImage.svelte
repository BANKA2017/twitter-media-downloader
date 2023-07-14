<script lang="ts">
    import { onMount } from 'svelte';
    import { PUBLIC_BASEPATH } from '$env/static/public';

    export let list: any[];
    export let aspect_ratio: string;

    let realList = [];
    let fullMedia = true;

    const flexibleMode = { value: false };

    onMount(() => {
        let tmpNameList: string[] = [];
        let tmpList: any[] = [];
        list?.forEach((x) => {
            if (!tmpNameList.includes(x.filename)) {
                tmpNameList.push(x.filename);
                tmpList.push(x);
            }
        });
        const tmpRealList = [];
        for (let media of tmpList) {
            media.url = PUBLIC_BASEPATH + '/media/proxy/' + media.url;
            tmpRealList.push(media);
        }
        realList = tmpRealList;
    });
</script>

<div id="tweet-image">
    <div
        class={'grid grid-cols-2 gap-0.5 rounded-xl ' + (realList.length > 1 ? 'aspect-video' : '')}
    >
        {#each realList as media, index}
            <div
                class={'bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden ' +
                    (realList.length === 1 ? 'col-span-2 ' : ' ') +
                    (realList.length === 2 || (realList.length === 3 && index === 0)
                        ? 'row-start-1 '
                        : ' ') +
                    (realList.length === 2 || (realList.length === 3 && index === 0)
                        ? 'row-end-3'
                        : '')}
            >
                {#if media.content_type.startsWith('video')}
                    <video
                        class={'w-full h-[100%] rounded-xl ' +
                            (realList.length >= 3 && index !== 0 && !fullMedia
                                ? 'aspect-video'
                                : '')}
                        src={media.url}
                        controls
                        preload="metadata"
                    />
                {/if}
                {#if !media.content_type.startsWith('video')}
                    <img
                        alt={media.basename}
                        class={'cursor-zoom-in w-full object-cover h-[100%] rounded-xl ' +
                            (realList.length >= 3 && index !== 0 && !fullMedia
                                ? 'aspect-video'
                                : '')}
                        src={media.url}
                        on:click={() => {
                            window.open(media.url);
                        }}
                    />
                {/if}
            </div>
        {/each}
    </div>
</div>
