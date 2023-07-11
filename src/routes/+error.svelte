<script>
    import { page } from '$app/stores';

    const errorMessage = {
        302: 'Redirecting...',
        404: 'Not found',
        500: 'Crash!'
    };
    console.log($page);
</script>

<h1 class="text-6xl mb-5 dark:text-white">{$page.status}</h1>
<p class="text-xl dark:text-sky-100">
    {errorMessage[$page.status]}，Go back to <a class="underline underline-offset-2" href="/" target="_blank" >Main page</a>~
</p>
