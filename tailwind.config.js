export default {
    content: [
        './components/**/*.{vue,js}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
        './app.vue',
        './node_modules/@nuxt/ui/dist/**/*.{js,vue,ts}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f3f6fc',
                    100: '#e6edf9',
                    200: '#c8d9f2',
                    300: '#97b9e6',
                    400: '#6194d7',
                    500: '#3e73c3',
                    600: '#2e59a5',
                    700: '#274886',
                    800: '#253e6f',
                    900: '#21345c',
                    950: '#162038',
                },
                neutral: {
                    50: '#f9fafb',
                    100: '#f2f4f7',
                    200: '#e5e8ed',
                    300: '#d1d7df',
                    400: '#b2bac8',
                    500: '#909cb1',
                    600: '#768297',
                    700: '#314158',
                    800: '#10182b',
                    900: '#0f172b',
                    950: '#020618',
                }
            },
            fontFamily: {
                sans: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}