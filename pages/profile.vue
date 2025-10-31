<template>
    <div class="flex max-lg:flex-col gap-8 grow">
        <div class="w-full lg:w-[30%] flex flex-col gap-2">
            <div class="flex items-center gap-4">
                <p class="font-medium text-xl">user_123456</p>
                <button class="flex cursor-pointer">
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
                        <button class="bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#131313] transition-all duration-500 hover:opacity-70">Обновить</button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Техническая информация</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">ID пользователя</p>
                        </div>
                        <button class="bg-white px-4 py-1.5 rounded-xl font-semibold text-sm text-[#131313] transition-all duration-500 hover:opacity-70">Скопировать ID</button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <p class="font-medium ml-2 text-sm text-gray-400">Ещё</p>
                    <div class="flex max-md:flex-col gap-2 md:justify-between md:items-center rounded-xl border border-white/20 p-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-base">Удаление аккаунта</p>
                        </div>
                        <button class="border border-red-400 px-4 py-1.5 rounded-xl font-semibold text-sm text-red-400 transition-all duration-500 hover:opacity-70">Удалить</button>
                    </div>
                </div>
            </div>

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
                        <div class="flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-green-500/10">
                                <Icon class="text-3xl" name="ic:round-message"/>
                            </div>
                            <p class="text-2xl md:text-3xl font-mono font-semibold">47</p>
                            <p class="text-green-400">Сообщений</p>
                        </div>
                        <div class="flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-blue-500/10">
                                <Icon class="text-3xl" name="material-symbols:image"/>
                            </div>
                            <p class="text-2xl md:text-3xl font-mono font-semibold">3</p>
                            <p class="text-blue-400">Изображений</p>
                        </div>
                        <div class="flex flex-col gap-2 bg-[#201e18] items-center text-center p-4 rounded-xl">
                            <div class="flex items-center justify-center p-2 rounded-xl bg-orange-500/10">
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

        <div v-if="isSupportModalShow" @click="isSupportModalShow = false" class="fixed inset-0 bg-black/3 backdrop-blur-[3px] z-[3]"></div>
        <div v-if="isSupportModalShow" class="fixed w-[calc(100%-30px)] z-[4] md:w-1/2 lg:w-3/5 top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 p-4 rounded-xl border border-white/20 bg-[#222222] flex flex-col gap-4">
            <div class="flex items-center justify-between gap-4 w-full">
                <p class="text-xl font-mono font-semibold">Связь с нами</p>
                <button @click="isSupportModalShow = flase" class="cursor-pointer rounded-full bg-[#14120B] p-1 flex items-center justify-center">
                    <Icon class="text-xl" name="material-symbols:close-rounded"/>
                </button>
            </div>
            <p class="text-gray-400">По всем вопросам технической поддержки, включая проблемы с оплатой и общие вопросы, пожалуйста, используйте телеграм <a href="https://t.me/fire83274" target="_blank" class="underline font-mono font-semibold text-white">@fire83274</a></p>
        </div>
    </div>
  </template>
  
  <script setup>
  /* название и язык страницы */
  useSeoMeta({
    title: 'Профиль',
    lang: 'ru'
  })
  
  /* состояния */
  const tabs = ref("settings")
  const isSupportModalShow = ref(false)
  const { id } = useUserStore()
  
  /* подключение хранилищ */
  const { showMessage } = useMessagesStore()
 
  
  /* загрузка данных пользователя */
  onMounted(async () => {
    
  })
  
  /* загрузка данных пользователя */
  const loadUserData = async () => {
   
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
  
  const deleteAccount = () => {

  }
  </script>