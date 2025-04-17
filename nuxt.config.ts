// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

    // https://github.com/nuxt/nuxt/discussions/27779#discussioncomment-9952440
    // to fix the weird websocket errors
    // `client:732 GET http://localhost:24678/_nuxt/ net::ERR_CONNECTION_REFUSED`
    vite: {
        server: {
            hmr: {
                clientPort: 3000
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern' // or "modern"
                }
            }
        }
    },

    devServer: {
        host: ''
    },

    runtimeConfig: {
        public: {
            NUXT_BASE_PATH: process.env.NUXT_BASE_PATH
        }
    },
    ssr: true,

    app: {
        head: {
            title: 'Media', // default fallback title
            htmlAttrs: {
                lang: 'en'
            },
            link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
        }
    },

    modules: [
        'nuxt-lodash',
        '@vueuse/nuxt',
        '@nuxtjs/tailwindcss',
        '@unocss/nuxt',
        [
            '@pinia/nuxt',
            {
                autoImports: [
                    // automatically imports `defineStore`
                    'defineStore' // import { defineStore } from 'pinia'
                ]
            }
        ]
    ],

    imports: {
        dirs: ['./stores']
    },

    experimental: {
        appManifest: false,
        payloadExtraction: false
    },

    tailwindcss: {
        cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
        configPath: 'tailwind.config',
        exposeConfig: { level: 2 },
        config: {},
        viewer: true
    },

    compatibilityDate: '2024-11-10'
})
