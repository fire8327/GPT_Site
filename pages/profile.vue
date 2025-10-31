<template>
    <div class="flex max-lg:flex-col gap-8 grow">
        <div class="w-full lg:w-[30%] flex flex-col gap-2">
            <div class="flex items-center gap-4">
                <p class="font-medium text-xl">{{ user?.login ? `${user?.login}` : 'загрузка...' }}</p>
                <button @click="isLoginModalShow = true" class="flex cursor-pointer">
                    <Icon class="text-2xl" name="material-symbols-light:edit"/>
                </button>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-1 h-1 rounded-full bg-green-400"></div>
                <p class="-mt-1 text-sm font-mono font-medium text-green-400">Подписка активна</p>
            </div>
            <div class="w-full h-px bg-white/20 my-2"></div>
            <button @click="tabs = 'settings'" class="cursor-pointer flex items-center gap-2 text-gray-400 text-base p-2 rounded-xl transition-all duration-500 hover:bg-[#201e18] hover:text-white">
                <Icon class="text-xl" name="material-symbols:settings-outline"/>
                <span>Настройки</span>
            </button>
            <button @click="tabs = 'subscribtion'" class="cursor-pointer flex items-center gap-2 text-gray-400 text-base p-2 rounded-xl transition-all duration-500 hover:bg-[#201e18] hover:text-white">
                <Icon class="text-xl" name="fluent:payment-16-regular"/>
                <span>Подписка</span>
            </button>
            <button @click="tabs = 'stats'" class="cursor-pointer flex items-center gap-2 text-gray-400 text-base p-2 rounded-xl transition-all duration-500 hover:bg-[#201e18] hover:text-white">
                <Icon class="text-xl" name="material-symbols:data-usage-rounded"/>
                <span>Использование и Статистика</span>
            </button>
            <button @click="isSupportModalShow = true" class="cursor-pointer flex items-center gap-2 text-gray-400 text-base p-2 rounded-xl transition-all duration-500 hover:bg-[#201e18] hover:text-white">
                <Icon class="text-xl" name="ic:round-email"/>
                <span>Связь с разработчиком</span>
            </button>
            <button @click="logout" class="cursor-pointer flex items-center gap-2 text-gray-400 text-base p-2 rounded-xl transition-all duration-500 hover:bg-[#201e18] hover:text-white">
                <Icon class="text-xl" name="solar:logout-broken"/>
                <span>Выход</span>
            </button>
        </div>
        <div class="w-full lg:w-[70%] h-full">
            <!-- настройки -->
            <div v-if="tabs === 'settings'" class="flex flex-col gap-6">
                <p class="text-xl font-mono font-semibold">Настройки</p>
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Приватность</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">Смена пароля</p>
                            <p class="text-sm text-gray-400">Обновите пароль для входа в вашу учётную запись</p>
                        </div>
                        <button @click="isPassModalShow = true" class="cursor-pointer bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#14120B] transition-all duration-500 hover:opacity-70">Обновить</button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Техническая информация</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">ID пользователя</p>
                            <p class="text-sm text-gray-400">{{ user?.id ? `${user?.id}` : 'загрузка...' }}</p>
                        </div>
                        <button @click="copyToClipboard(user?.id)" class="cursor-pointer bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#14120B] transition-all duration-500 hover:opacity-70">Скопировать ID</button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Ещё</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">Удаление аккаунта</p>
                        </div>
                        <button @click="isDeleteModalShow = true" class="cursor-pointer border border-red-400 px-4 py-1.5 rounded-xl font-semibold text-sm text-red-400 transition-all duration-500 hover:opacity-70">Удалить</button>
                    </div>
                </div>
            </div>

            <!-- подписка -->
            <div v-if="tabs === 'subscribtion'" class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Подписка</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">Текущий тариф: <span class="font-semibold">Free</span></p>
                            <p class="text-sm text-gray-400">Действует до: 03.09.2029</p>
                        </div>
                        <button class="border border-green-400 text-green-400 px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-500 hover:opacity-70">
                            Активировать
                        </button>
                    </div>
                </div>
            </div>

            <!-- статистика -->
            <div v-if="tabs === 'stats'" class="flex flex-col gap-8">
                <div class="flex flex-col gap-6 p-4 rounded-xl border border-white/20">
                    <div class="flex items-center gap-4">
                        <Icon class="text-3xl" name="fluent:data-usage-16-regular"/>
                        <p class="text-xl md:text-2xl font-mono font-semibold">Статистика пользователя</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="group flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl transition-all duration-500 hover:-translate-y-3 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Icon class="text-3xl" name="ic:round-message"/>
                            </div>
                            <p class="text-2xl md:text-3xl font-mono font-semibold">47</p>
                            <p class="text-green-400">Сообщений</p>
                        </div>
                        <div class="group flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl transition-all duration-500 hover:-translate-y-3 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Icon class="text-3xl" name="material-symbols:image"/>
                            </div>
                            <p class="text-2xl md:text-3xl font-mono font-semibold">3</p>
                            <p class="text-blue-400">Изображений</p>
                        </div>
                        <div class="group flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl transition-all duration-500 hover:-translate-y-3 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                            <Icon class="text-3xl" name="ic:round-smart-toy"/>
                            </div>
                            <p class="text-2xl md:text-3xl font-mono font-semibold">0/5</p>
                            <p class="text-orange-400">Диалогов</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-6 p-4 rounded-xl border border-white/20">
                    <p class="text-xl md:text-2xl font-mono font-semibold">Использование</p>
                    <p class="text-center text-sm text-gray-400">В разработке...</p>
                </div>
            </div>
        </div>

        <!-- модальные окна -->
        <ProfileModal :is-open="isSupportModalShow" @close="isSupportModalShow = false">
            <p class="text-xl font-mono font-semibold">Связь с нами</p>
            <p class="text-gray-400">По всем вопросам технической поддержки, включая проблемы с оплатой и общие вопросы, пожалуйста, используйте телеграм <a href="https://t.me/fire83274" target="_blank" class="underline font-mono font-semibold text-white">@fire83274</a></p>
        </ProfileModal>

        <ProfileModal :is-open="isLoginModalShow" @close="isLoginModalShow = false">
            <p class="text-xl font-mono font-semibold">Смена логина</p>
            <FormKit @submit="updLogin" type="form" :actions="false" messages-class="hidden" form-class="space-y-6">
                <FormKit :value="user?.login" validation="required" placeholder="user_123456" label="Логин" label-class="hidden" name="login" type="text" messages-class="text-[#E9556D] font-mono" outer-class="w-full" input-class="w-full px-4 py-1.5 rounded-xl border border-white/20 bg-[#14120B]"/>
                <div class="flex items-center gap-2 md:justify-end">
                    <button class="cursor-pointer bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#14120B] transition-all duration-500 hover:opacity-70">Обновить</button>
                    <button @click="isLoginModalShow = false" class="cursor-pointer border border-white px-4 py-1.5 rounded-xl font-semibold text-sm text-white transition-all duration-500 hover:opacity-70">Отмена</button>
                </div>
            </FormKit>
        </ProfileModal>
        
        <ProfileModal :is-open="isPassModalShow" @close="isPassModalShow = false">
            <p class="text-xl font-mono font-semibold">Смена пароля</p>
            <FormKit @submit="updPass" type="form" :actions="false" messages-class="hidden" form-class="space-y-6">
                <FormKit validation="required|length:6" placeholder="······" label="Пароль" label-class="hidden" name="password" type="text" messages-class="text-[#E9556D] font-mono" outer-class="w-full" input-class="w-full px-4 py-1.5 rounded-xl border border-white/20 bg-[#14120B]"/>
                <div class="flex items-center gap-2 md:justify-end">
                    <button class="cursor-pointer bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#14120B] transition-all duration-500 hover:opacity-70">Обновить</button>
                    <button @click="isPassModalShow = false" class="cursor-pointer border border-white px-4 py-1.5 rounded-xl font-semibold text-sm text-white transition-all duration-500 hover:opacity-70">Отмена</button>
                </div>
            </FormKit>
        </ProfileModal>       

        <ProfileModal :is-open="isDeleteModalShow" @close="isDeleteModalShow = false">
            <p class="text-xl font-mono font-semibold text-red-400">Удаление аккаунта</p>
            <p class="text-sm font-medium text-gray-400">Напишите "Удалить" для подтверждения</p>
            <FormKit @submit="deleteAccount" type="form" :actions="false" messages-class="hidden" form-class="space-y-6">
                <FormKit v-model="confirmDelete" validation="required" label="Удаление" label-class="hidden" name="delete" type="text" messages-class="text-[#E9556D] font-mono" outer-class="w-full" input-class="w-full px-4 py-1.5 rounded-xl border border-white/20 bg-[#14120B]"/>
                <div class="flex items-center gap-2 md:justify-end">
                    <button :disabled="confirmDelete !== 'Удалить'" :class="confirmDelete === 'Удалить' ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed opacity-50'" class="border border-red-400 px-4 py-1.5 rounded-xl font-semibold text-sm text-red-400 transition-all duration-500">Удалить</button>
                    <button @click="isDeleteModalShow = false" class="cursor-pointer border border-white px-4 py-1.5 rounded-xl font-semibold text-sm text-white transition-all duration-500 hover:opacity-70">Отмена</button>
                </div>
            </FormKit>
        </ProfileModal>        
    </div>
  </template>
  
<script setup>
/* название и язык страницы */
useSeoMeta({
    title: 'Профиль',
    lang: 'ru'
})

/* роутер */
const router = useRouter()

/* состояния */
const tabs = ref("settings")
const isSupportModalShow = ref(false)
const isLoginModalShow = ref(false)
const isPassModalShow = ref(false)
const isDeleteModalShow = ref(false)
const confirmDelete = ref("")

/* подключение хранилищ и бд */
const { showMessage } = useMessagesStore()
const { id, logout } = useUserStore()
const supabase = useSupabaseClient()

/* первоначальная загрузка данных */
onMounted(async () => {
    loadUserData()
})

/* загрузка данных пользователя */
const user = ref()
const loadUserData = async () => {
    const { data, error } = await supabase
    .from('website_users')
    .select("*")
    .eq('id', id)
    .single()

    user.value = data
}

/* загрузка статистики */
const loadUserStats = async () => {

}


const getActivityIcon = (type) => {
const icons = {
    message: '💬',
    image: '🎨',
    login: '🔐',
    file: '📁',
    payment: '💳'
}
return icons[type] || '⚡'
}

/* действия */  
const contactSupport = () => {

}

const deleteAccount = async() => {
    if(confirmDelete.value === 'Удалить'){        
        const { error } = await supabase
        .from('website_users')
        .delete()
        .eq('id', id)

        if (!error) {
            router.push("/")
            logout()
            return showMessage("Аккаунт удалён!", true) 
        } else {
            return showMessage("Произошла ошибка при обновлении!", false) 
        }
    }
}

const updLogin = async(form) => {
    const { data, error } = await supabase
    .from('website_users')
    .update({ login: form.login })
    .eq('id', id)
    .select()

    if (!error) {
        loadUserData()
        isLoginModalShow.value = false
        return showMessage("Успешно обновлено!", true) 
    } else {
        return showMessage("Произошла ошибка при обновлении!", false) 
    }
}

const updPass = async(form) => {
    const { data, error } = await supabase
    .from('website_users')
    .update({ password: form.password })
    .eq('id', id)
    .select()

    if (!error) {
        loadUserData()
        isPassModalShow.value = false
        return showMessage("Успешно обновлено!", true) 
    } else {
        return showMessage("Произошла ошибка при обновлении!", false) 
    }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Текст скопирован: ', text)
    return showMessage('Текст скопирован!', true)
  } catch (err) {
    console.error('Ошибка копирования: ', err)
    // Fallback для старых браузеров
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return showMessage('Текст скопирован!', true)
    } catch (fallbackErr) {
      return showMessage('Не удалось скопировать текст', false)
    }
  }
}
</script>