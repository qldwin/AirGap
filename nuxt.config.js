export default defineNuxtConfig({
    compatibilityDate: "2026-03-05",
    devtools: {enabled: true},
    css: ["~/assets/css/styles.css"],
    modules: ["@nuxt/ui", "nuxt-auth-utils", "@nuxt/eslint", "shadcn-nuxt"],

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui'
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
            }
        }
    },
    nitro: {
        replace: {
            'typeof window': '`undefined`',
        }
    }
});