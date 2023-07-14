<script>
    import '../app.css';
    import DarkButton from '$lib/components/DarkButton.svelte';
</script>

<svelte:head>
    <title>Media</title>
    <meta name="description" content="Download tweet media in one point" />
</svelte:head>

<div id="main" class="dark:bg-black dark:text-white transition-colors min-h-[100vh]">
    <div class="flex justify-between py-5 lg:px-20 p-5">
        <a href="/" id="nav-title" class="text-3xl font-bold">
            Media <span class="ml-1 bg-sky-500 text-white text-sm px-2 rounded-full">beta</span>
        </a>
        <DarkButton />
    </div>

    <div class="grid grid-cols-12 p-3 md:p-10 gap-5">
        <div class="col-span-12 md:col-span-2 text-center hidden md:block">
            <div id="ad-1" class=" border-2 h-[10rem] md:h-[60vh]">AD</div>
        </div>
        <div class="col-span-12 md:col-span-8 mb-10">
            <slot />
            <div class="w-full text-center items-end my-10 text-sm">
                <div class="text-sm text-gray-500 my-5">A Twitter Monitor Project</div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-2 text-center">
            <div id="ad-2" class=" border-2 h-[10rem] md:h-[60vh]">AD</div>
        </div>
    </div>
</div>
