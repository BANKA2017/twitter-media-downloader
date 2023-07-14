<script lang="ts">
    import { Parser } from 'm3u8-parser';
    import { onMount } from 'svelte';
    import { PUBLIC_BASEPATH } from '$env/static/public';
    import { concatBuffer } from '$lib/share/Parser';
    import { Download } from '$lib/share/Tools';
    import { beforeNavigate } from '$app/navigation';
    let metaData;
    let m3u8Prefix = '';
    let count = 0;
    let firstTimeCursor = 0;

    let indexPrefix = 0;
    const thread = 10;

    let src = '';

    let fetchChunkWorker = null;

    let spaceInfo = {};

    let completeList = [];

    let loadingStatus: 'info' | 'm3u8' | 'error' | '' = 'info'; //m3u8 //'' as done

    let controller = null;

    const sourceOpen = async () => {
        for (const index in metaData.manifest.segments.slice(indexPrefix, thread + indexPrefix)) {
            count = Number(index) + 1;
            const segment = metaData.manifest.segments[index];
            fetchChunkWorker.postMessage({
                uri: PUBLIC_BASEPATH + '/media/proxy/' + m3u8Prefix + segment.uri,
                index: Number(index) + indexPrefix
            });
        }
    };
    const getDate = (timestamp: number = 0) => {
        const tmpDate = new Date(timestamp);
        const monthName = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Set',
            'Oct',
            'Nov',
            'Dec'
        ];
        //4:22 PM · 19 Aug, 2022
        return `${tmpDate.getHours()}:${tmpDate
            .getMinutes()
            .toString()
            .padStart(2, '0')} · ${tmpDate.getDate()} ${
            monthName[tmpDate.getMonth()]
        }, ${tmpDate.getFullYear()}`;
    };

    const getSpaceInfo = async (id) => {
        if (!id || !/^1[a-zA-Z]+$/g.test(id || '')) {
            loadingStatus = 'error';
            return;
        }
        try {
            spaceInfo = await (
                await fetch(`${PUBLIC_BASEPATH}/online/api/v3/data/audiospace/?id=${id}`, {
                    signal: controller.signal
                })
            ).json();
            //console.log(spaceInfo);
            if (spaceInfo?.data?.playback) {
                m3u8Prefix =
                    ((x) => x.host + x.pathname)(new URL(spaceInfo.data.playback))
                        .split('/')
                        .slice(0, -1)
                        .join('/') + '/';
                loadingStatus = 'm3u8';
                await getM3U8(spaceInfo.data.playback);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const getM3U8 = async (link) => {
        if (!link) {
            return;
        }
        try {
            const m3u8Str = await (
                await fetch(
                    `${PUBLIC_BASEPATH}/media/proxy/${link.replace(/http(?:s):\/\//g, '')}`,
                    {
                        signal: controller.signal
                    }
                )
            ).text();
            let m3u8Parser = new Parser();
            m3u8Parser.push(m3u8Str);
            m3u8Parser.end();
            metaData = m3u8Parser;
            loadingStatus = '';
            await sourceOpen();
        } catch (e) {
            console.log(e);
        }
    };

    let bufferList = [];
    const anyUseScript = () => {
        //console.log(
        //    bufferList,
        //    bufferList.sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
        //);
        const aacBuffer = concatBuffer(
            bufferList
                .sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
                .map((buffer) => buffer[1])
        );
        src = URL.createObjectURL(new Blob([aacBuffer], { type: 'audio/aac' }));
        frameInfoList = frameInfoList
            .map((frame) => frame.filter((frameItem) => ['TIT3', 'TXXX'].includes(frameItem[0])))
            .filter((x) => x.length > 0)
            .map((x) =>
                Object.fromEntries(
                    x.map((y) => [
                        y[0] === 'TIT3' ? 'currentTime' : y[3][0],
                        y[0] === 'TIT3' ? Number(y[3]) : y[3][1]
                    ])
                )
            )
            .filter((x) => x.currentTime)
            .sort((a, b) => a.currentTime - b.currentTime);
        if (firstTimeCursor === 0 && frameInfoList.length > 0) {
            firstTimeCursor = Number(frameInfoList[0].currentTime);
        }
        //console.log(frameInfoList);
    };

    let frameInfoList = [];
    let audioCurrentTime = 0;
    onMount(() => {
        searchParams = Object.fromEntries([...new URLSearchParams(window.location.search)]);
        controller = new AbortController();
        const audioDom = document.getElementsByTagName('audio')[0];
        audioDom.addEventListener('timeupdate', (e) => {
            audioCurrentTime = e.target?.currentTime || 0;
        });
        fetchChunkWorker = new Worker(
            new URL('../../lib/workers/FetchChunkWorker', import.meta.url),
            {
                type: 'module'
            }
        );
        fetchChunkWorker.onmessage = (e) => {
            bufferList = bufferList.concat([[e.data.uri, e.data.bufferList]]);
            frameInfoList = frameInfoList.concat(e.data.frameInfoList);
            completeList = completeList.concat([e.data.uri]);
            count++;
            //console.log(e)
            //console.log(
            //    e.data.index,
            //    e.data.index + thread,
            //    metaData.manifest.segments[e.data.index + thread]?.uri
            //);
            if (!controller.aborted && metaData.manifest.segments[e.data.index + thread]?.uri) {
                fetchChunkWorker.postMessage({
                    uri:
                        PUBLIC_BASEPATH +
                        '/media/proxy/' +
                        m3u8Prefix +
                        metaData.manifest.segments[e.data.index + thread].uri,
                    index: e.data.index + thread
                });
            }
        };
        fetchChunkWorker.onerror = (e) => {
            console.log(e);
        };
        getSpaceInfo(searchParams.id);
    });
    $: percent = ((count + indexPrefix) / (metaData?.manifest?.segments?.length || 0)) * 100;
    $: currentFrameInfo =
        frameInfoList.find((x) => x.currentTime > firstTimeCursor + audioCurrentTime) || {};
    $: participants = [
        ...(spaceInfo?.data?.admins || []),
        ...(currentFrameInfo?.HydraParticipants || []).map(
            (user) => spaceInfo.data.speakers.find((x) => x.name === user.UserName) || user
        )
    ];
    $: completeList,
        (() => {
            //console.log(
            //    completeList.length,
            //    indexPrefix,
            //    metaData?.manifest?.segments?.length || 0
            //);
            if (
                metaData &&
                completeList.length + indexPrefix >= (metaData?.manifest?.segments?.length || 0)
            ) {
                anyUseScript();
            }
        })();

    $: searchParams = {};

    beforeNavigate(({ from, to, cancel }) => {
        fetchChunkWorker.terminate();
        controller.abort();
    });
</script>

{#if loadingStatus}
    {#if loadingStatus === 'error'}
        <div>
            Invalid space id #{searchParams.id}, back to
            <a
                href="/"
                class="dark:decoradetion-sky-300 decoration-sky-400 underline-offset-4 underline"
                >main page</a
            >...
        </div>
    {/if}
    {#if loadingStatus !== 'error'}
        <div>
            loading space {loadingStatus} #{searchParams.id}...
        </div>
    {/if}
{/if}

{#if !loadingStatus && spaceInfo?.data?.id}
    <div class="flex justify-between mb-2">
        <h4 class="text-2xl font-bold">{spaceInfo.data.title}</h4>
        <a
            href={'https://twitter.com/i/spaces/' + spaceInfo.data.id}
            target="_blank"
            class="inline-block mr-1 text-sm border-2 border-[#9C63FA] rounded-full max-w-[15em] h-6"
            ><span class="bg-[#9C63FA] px-2 rounded-full text-white">Space</span><span
                class="text-black dark:text-white px-2">{spaceInfo.data.total}</span
            ></a
        >
    </div>
    <div class="font-light">
        <span>Since {getDate(Number(spaceInfo.data.start))}</span>
        <span class="px-2 text-sm">{spaceInfo.data.state}</span>
    </div>
    <div
        class={'h-8 w-full text-center relative ' +
            (percent >= 100 && src ? 'hidden' : 'inline-block')}
    >
        <span class="absolute py-1 -translate-x-1/2 text-current"
            >{count + indexPrefix} / {metaData?.manifest?.segments?.length || 0}</span
        >
        <div class="h-full bg-sky-500 rounded-xl" style={`width: ${percent}%;`} />
    </div>
    {#if src}
        <div class="grid grid-cols-3 md:grid-col-4 lg:grid-cols-6 gap-2">
            {#each participants as user, index}
                <a
                    class="col-span-1 p-2 rounded-xl hover:text-white hover:bg-sky-500 dark:hover:bg-sky-800 transition-colors text-center"
                    href={`https://twitter.com/${user.name || user.UserName}`}
                    target="_blank"
                >
                    <div class="flex justify-center w-full">
                        <div class="relative">
                            <div
                                class={'absolute rounded-full bg-sky-500 p-1 -right-1 -bottom-1 ' +
                                    (currentFrameInfo?.HydraAudioLevel?.[index] || 0
                                        ? 'inline-block'
                                        : 'hidden')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="text-white"
                                    width="0.65rem"
                                    height="0.65rem"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
                                    <path
                                        d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"
                                    />
                                </svg>
                            </div>
                            <img
                                class="rounded-full w-[50px]"
                                src={(user.avatar || user.ProfileUrl).replace('_normal.', '.')}
                                alt={user.display_name || user.UserName}
                            />
                        </div>
                    </div>
                    <span class="block font-bold">{user.display_name || user.UserName}</span>
                </a>
            {/each}
        </div>
    {/if}
{/if}

<div class={'fixed left-0 bottom-5 w-full grid grid-cols-12 gap-5 '}>
    <div class="col-span-11 md:col-span-7 md:col-start-3">
        <audio {src} controls class="w-full" />
    </div>
    <div class="col-span-1 md:col-span-1">
        <button
            class="transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-3 h-14"
            on:click={() => {
                Download(
                    src,
                    `${spaceInfo.data.title.replaceAll(' ', '_')}_${spaceInfo.data.id}.aac`
                );
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                fill="currentColor"
                class="bi bi-download"
                viewBox="0 0 16 16"
            >
                <path
                    d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                />
                <path
                    d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                />
            </svg>
        </button>
    </div>
</div>
