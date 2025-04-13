<script lang="ts">
    import { onMount } from 'svelte';
    import { PUBLIC_BASEPATH } from '$env/static/public';
    import TwImage from '$lib/components/TwImage.svelte';
    import { goto } from '$app/navigation';

    let loadingStatus: 'info' | 'error' | '' = 'info'; //m3u8 //'' as done
    let mediaData: any = {};

    const getMedia = async (id) => {
        if (isNaN(Number(id))) {
            loadingStatus = 'error';
            return;
        }

        const tmpMediaData = await (
            await fetch(`${PUBLIC_BASEPATH}/online/api/v3/data/media/?tweet_id=${id}`)
        ).json();
        if (tmpMediaData?.data?.card_info?.type === 'audiospace') {
            goto(`/space?id=${tmpMediaData?.data?.card_info?.id}`, { replaceState: true });
        } else {
            mediaData = tmpMediaData;
        }
    };

    onMount(async () => {
        searchParams = Object.fromEntries([...new URLSearchParams(window.location.search)]);
        if (searchParams?.id) {
            await getMedia(searchParams.id);
        }
    });

    $: searchParams = {};
    $: videoIndexList = ((mediaList) => {
        let tmpVideoIndexList = [];
        for (const mediaIndex in mediaList) {
            if (mediaList[mediaIndex].content_type === 'video/mp4') {
                tmpVideoIndexList = tmpVideoIndexList.concat([Number(mediaIndex)]);
            }
        }
        return tmpVideoIndexList;
    })(mediaData?.data?.media_info || []);
    //TODO download meta data
</script>

<div class="w-full">
    <div class="flex justify-center">
        {#if !mediaData.code}
            {#if loadingStatus === 'error'}
                <div>
                    Invalid tweet id #{searchParams.id}, back to
                    <a
                        href="/"
                        class="dark:decoradetion-sky-300 decoration-sky-400 underline-offset-4 underline"
                        >main page</a
                    >...
                </div>
            {/if}
            {#if loadingStatus !== 'error'}
                <div>
                    loading tweet {loadingStatus} #{searchParams.id}...
                </div>
            {/if}
        {/if}
        {#if mediaData.code === 200}
            <div class="max-w-[40rem]">
                <TwImage list={mediaData.data.media_info} />
                <div class="list-group my-2">
                    {#each mediaData.data.media_info as mediaInfo, mediaOrder}
                        {#if mediaInfo.original_type !== 'video'}
                            <a
                                href={PUBLIC_BASEPATH + '/media/proxy/' + `${mediaInfo.url}:orig`}
                                target="_blank"
                                class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-between px-4 py-2 mb-2"
                            >
                                {mediaInfo.basename}
                                <div class="gap-2">
                                    <span class="text-white px-2 rounded-full bg-sky-500"
                                        >{mediaInfo.original_info_height +
                                            'x' +
                                            mediaInfo.original_info_width}</span
                                    >
                                    <span class="text-white px-2 rounded-full bg-green-500"
                                        >{mediaOrder + 1}</span
                                    >
                                </div>
                            </a>
                        {/if}
                        {#if mediaInfo.original_type === 'video'}
                            {#each (mediaData.data.video_info[videoIndexList.indexOf(mediaOrder)]?.variants || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0)) as video, order}
                                <a
                                    href={PUBLIC_BASEPATH + '/media/proxy/' + mediaInfo.url}
                                    target="_blank"
                                    class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-between px-4 py-2 mb-2"
                                >
                                    {video.url.replace(/.*\/(.*)\.(?:mp4|m3u8).*/, `$1`)}
                                    <div class="gap-2">
                                        {#if video.content_type === 'video/mp4'}
                                            <span class="text-white px-2 rounded-full bg-pink-500"
                                                >{video.bitrate / 1000 + ' kbps'}</span
                                            >
                                        {/if}
                                        <span class="text-white px-2 rounded-full bg-sky-500"
                                            >{video.content_type === 'video/mp4'
                                                ? video.url.replace(/.*\/(\d+x\d+)\/.*/, `$1`)
                                                : `m3u8`}</span
                                        >
                                        <span class="text-white px-2 rounded-full bg-green-500"
                                            >{mediaOrder + 1}</span
                                        >
                                    </div>
                                </a>
                            {/each}
                        {/if}
                    {/each}
                </div>
                <details class="collapse bg-gray-200 dark:bg-gray-800 transition-colors">
                    <summary
                        class="collapse-title text-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700"
                        >>_ Meta data</summary
                    >
                    <div class="collapse-content overflow-x-scroll bg-gray-800 p-3">
                        <pre class="rounded-xl text-white">{JSON.stringify(
                                mediaData.data,
                                null,
                                4
                            )}</pre>
                    </div>
                </details>
            </div>
        {/if}
    </div>
</div>
