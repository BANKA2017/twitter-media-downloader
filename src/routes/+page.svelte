<script lang="ts">
    const inputParser = (text: string = '') => {
        if (!text) {
            return ['_', null];
        }
        let urlHandle = null,
            isURL = true;
        try {
            urlHandle = new URL(text);
        } catch (e) {
            isURL = false;
        }
        if (/^1\d+$/g.test(text)) {
            return ['tweet', text];
        } else if (/^1[a-zA-Z]+$/g.test(text)) {
            return ['space', text];
        } else if (isURL && urlHandle?.pathname?.startsWith('/i/spaces/')) {
            return ['space', urlHandle?.pathname.split('/').pop()];
        } else if (isURL && /^\/\w+\/status\/\d+$/g.test(urlHandle?.pathname)) {
            return ['tweet', urlHandle?.pathname?.split('/').pop()];
        } else {
            return ['_', null];
        }
    };

    let textInput = '';

    $: toHref = (() => {
        const parseArray = inputParser(textInput);
        if (!parseArray[1]) {
            return '/';
        } else {
            return `/${parseArray[0]}/?id=${parseArray[1]}`;
        }
    })();
    //$: HydraAudioLevel = (() => {
    //	const tmpList = frameInfoList.filter(x => x.currentTime).map(x => ({currentTime: x.currentTime, HydraAudioLevel: x.HydraAudioLevel}))
    //	const tmpL = JSON.parse(JSON.stringify(new Array(spaceInfo.data.admins.length + spaceInfo.data.speakers.length + 1).fill([])))
    //	for (const index in tmpList) {
    //		tmpL[0].push(tmpList[index].currentTime)
    //		for (const index2 in tmpList[index].HydraAudioLevel) {
    //			tmpL[Number(index2) + 1].push(tmpList[index].HydraAudioLevel[index2])
    //		}
    //	}
    //	return tmpL
    //})()
</script>

<div class="rounded-xl bg-gray-200 dark:bg-gray-800 p-3 mb-5">
    <h3 class="text-2xl font-bold">How to...</h3>
    <p>
        Place <abbr title="e.g. 1601692766257709056">tweet id</abbr> /
        <abbr title="e.g. https://twitter.com/Twitter/status/1601692766257709056">link</abbr>
        / <abbr title="e.g. 1LyxBqqpkPpJN">space id</abbr> /
        <abbr title="e.g. https://twitter.com/i/spaces/1LyxBqqpkPpJN">space link</abbr>
    </p>
    <div class="pl-2">
        <div class="mb-2">
            <label for="support-list" class="text-xl text-sky-500">Support</label>
            <ul id="support-list" role="list" class="marker:text-sky-400 list-disc pl-5">
                <li class="">Image and video</li>
                <li class="">Spaces</li>
            </ul>
        </div>
        <div class="mb-2">
            <label for="unsupported-list" class="text-xl text-pink-500">Not yet...</label>
            <ul id="unsupported-list" role="list" class="marker:text-sky-400 list-disc pl-5">
                <li class="">NSFW media content</li>
                <li class="">Broadcasts</li>
                <li class="">Media in cards</li>
            </ul>
        </div>
    </div>
</div>
<div class="flex justify-between gap-3">
    <input
        type="text"
        class="form-input w-full rounded-xl h-[2em] md:h-[2.5em] dark:bg-black"
        bind:value={textInput}
        placeholder=""
    />
    {#if toHref !== '/'}
        <a class="px-4 py-1 text-xl rounded-xl bg-gray-200 dark:bg-gray-800" href={toHref}>Go</a>
    {/if}
</div>
