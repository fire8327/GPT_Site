// вспомогательные функции для работы с cookies
function useSynchronizedCookie(key, defaultValue) {
    const cookie = useCookie(key)
    const state = ref(cookie.value || defaultValue)

    watch(state, (newValue) => {
        cookie.value = newValue
    })

    return state
}

// хранилище состояния пользователя
export const useUserStore = defineStore("user", () => {
    const authenticated = useSynchronizedCookie('authenticated', false)
    const id = useSynchronizedCookie('id', null)

    /* сообщения и роутер */
    const { showMessage } = useMessagesStore()
    const router = useRouter()
    const supabase = useSupabaseClient()

    // функции для входа и выхода из аккаунта
    function login(userId) {
        authenticated.value = true
        id.value = userId
    }

    function logout() {
        authenticated.value = false
        id.value = null
        showMessage("Успешный выход", true)
        router.push("/")
    }

    return { authenticated, id, login, logout }
})