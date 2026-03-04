export default defineNuxtConfig({
    devtools: { enabled: true },
    css: ["~/assets/css/styles.css"],
    modules: ["@nuxt/ui", "nuxt-auth-utils", "@nuxt/eslint", "shadcn-nuxt"],

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
            }
        }
    }
});