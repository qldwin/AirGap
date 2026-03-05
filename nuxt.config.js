export default defineNuxtConfig({
    devtools: { enabled: true },
    css: ["~/assets/css/styles.css"],
    modules: ["@nuxt/ui", "nuxt-auth-utils", "@nuxt/eslint", "shadcn-nuxt", "@vite-pwa/nuxt"],

    shadcn: {
            prefix: '',
            componentDir: './components/ui'
    },

    runtimeConfig: {
         databaseUrl: '',
    },
    vite: {
        resolve: {
            alias: {
                crypto: "node:crypto",
            },
        },
    },

    app: {
        head: {
            bodyAttrs: {
                class: "font-sans",
            },
            link: [
                { rel: "manifest", href: "/manifest.webmanifest" },
                { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192x192.png" },
                { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512x512.png" },
            ]
        }
    },

    pwa: {
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        client: {
            installPrompt: true,
        },
        manifest: {
            "name": "AirGap",
            "short_name": "AirGap",
            "description": "AirGap was born from a simple desire: to enable sound and tamper-proof money management. Thanks to a local and encrypted architecture, you alone retain total control over your finances.",
            "lang": "fr",
            "start_url": "/",
            "display": "standalone",
            "icons": [
                {
                "src": "icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
                },
                {
                "src": "icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
                }
            ],
            "background_color": "#0f172b",
            "theme_color": "#16a34a"
        },
        workbox: {
            navigateFallback: '/',
        },
        devOptions: {
            enabled: true,
            type: 'module',
        }
    }
});