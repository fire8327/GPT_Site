<template>
    <div class="flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Вход
          </h1>
          <p class="text-gray-400 text-lg">
            Используйте логин и пароль из Telegram бота
          </p>
        </div>

        <FormKit @submit="authUser" type="form" :actions="false" messages-class="hidden" form-class="border border-gray-700 rounded-2xl p-8 space-y-6">
          <FormKit validation="required" placeholder="user_123456" label="Логин" name="login" type="text" messages-class="text-[#E9556D] font-mono" outer-class="w-full" input-class="w-full px-4 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
          <FormKit validation="required|length:6" placeholder="······" label="Пароль" name="password" type="password" messages-class="text-[#E9556D] font-mono" outer-class="w-full" input-class="w-full px-4 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>

          <button :disabled="isAuthDisabled" :class="{isAuthDisabled : 'opacity-70'}" type="submit" class="group relative w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span class="group-hover:translate-x-1 transition-transform">🚀</span>
              <span>{{ isAuthDisabled ? 'Вход...' : 'Войти в систему' }}</span>
          </button>
        </FormKit>
  
        <!-- Информационный блок -->
        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span class="text-blue-400">📱</span>
            </div>
            <div>
              <p class="text-blue-400 font-medium">Как получить доступ?</p>
              <p class="text-gray-400 text-sm">Используйте команду в Telegram боте</p>
            </div>
          </div>
          
          <div class="space-y-2 text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Перейдите в Telegram бота</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Отправьте команду <code class="bg-gray-700 px-2 py-1 rounded text-blue-300">/website</code></span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Используйте полученные данные для входа</span>
            </div>
          </div>
        </div>
  
        <!-- Дополнительные ссылки -->
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-3 text-gray-500">
            <div class="h-px bg-gray-700 flex-1"></div>
            <span class="text-sm">или</span>
            <div class="h-px bg-gray-700 flex-1"></div>
          </div>
  
          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            Вернуться на главную
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
/* название и язык страницы */
useSeoMeta({
    title: 'Вход',
    lang: 'ru'
})


/* создание сообщений и подключение хранилищ */
const { showMessage } = useMessagesStore()
const { login } = useUserStore()


/* подключение БД и роутера */
const supabase = useSupabaseClient()
const router = useRouter()

/* вход */
const isAuthDisabled = ref(false)
const authUser = async(formData) => {      
    isAuthDisabled.value = true
    const { data: user, error } = await supabase
    .from('website_users')
    .select("*")
    .eq('login', formData.login)
    .single()

    if (!user) {
        formData.login = ""
        isAuthDisabled.value = false
        return showMessage("Неверно введен логин!", false)              
    }

    if (formData.password !== user.password) {
        formData.password = ""
        isAuthDisabled.value = false
        return showMessage('Неверно введен пароль!', false)            
    }

    showMessage('Успешный вход!', true)
    console.log('Login successful, user ID:', user.id, 'Type:', typeof user.id)
    login(user.id)
    isAuthDisabled.value = false
    // Небольшая задержка чтобы cookie успел сохраниться
    await nextTick()
    router.push('/chat')
} 
  </script>