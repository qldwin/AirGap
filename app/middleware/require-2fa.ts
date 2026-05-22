export default defineNuxtRouteMiddleware(() => {
    const { session, loggedIn } = useUserSession()

    if (!loggedIn.value) {
        return navigateTo('/auth/login')
    }

    if (session.value?.secure?.twoFactorPending) {
        return navigateTo('/auth/2fa')
    }
})