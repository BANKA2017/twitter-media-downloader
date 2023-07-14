import type { PageServerLoad } from './$types';

export const prerender = true;

export const load = (async (e) => {
    return { searchParams: JSON.stringify(Object.fromEntries([...e.url.searchParams])) };
}) satisfies PageServerLoad;
