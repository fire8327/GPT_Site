<template>
    <div class="flex flex-col gap-8 text-center">
        <p class="text-4xl md:text-6xl font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Ваш AI-помощник для учёбы и работы
        </p>
        
        <p class="max-w-2xl text-lg text-gray-300 mx-auto leading-relaxed">
            Общайтесь с умным ассистентом, создавайте изображения, загружайте файлы и получайте помощь в любых вопросах
        </p>
        
        <NuxtLink :to="userStore.authenticated ? '/chat' : '/login'" class="group relative flex items-center gap-2 rounded-xl px-8 py-3 w-fit mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span class="font-semibold text-white">🚀 Начать</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
        </NuxtLink>
        
        <div class="flex flex-wrap justify-center gap-6 mt-4 text-sm text-gray-400">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Без кредитной карты</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Доступно в Telegram и на сайте</span>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-12 py-16 px-4 max-w-6xl mx-auto">
        <div class="text-center">
            <p class="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
                Возможности платформы
            </p>
            <p class="text-gray-400 max-w-2xl mx-auto">
                Все инструменты для продуктивной работы и обучения в одном месте
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div class="group relative transition-all duration-500 hover:-translate-y-3 flex flex-col gap-4 rounded-2xl bg-[#201e18] border border-white/20 hover:border-blue-500/30 p-6 text-center hover:shadow-2xl hover:shadow-blue-500/10">
                <div class="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span class="text-2xl">💬</span>
                </div>
                <p class="text-xl font-semibold text-white">Умный чат</p>
                <p class="text-gray-400 leading-relaxed">
                    Общайтесь с AI на любые темы, получайте развернутые ответы и помощь в решении задач
                </p>
                <div class="mt-auto text-blue-400 text-sm font-medium">
                    GPT-4o Mini · Мгновенные ответы
                </div>
            </div>

            <div class="group relative transition-all duration-500 hover:-translate-y-3 flex flex-col gap-4 rounded-2xl bg-[#201e18] border border-white/20 hover:border-purple-500/30 p-6 text-center hover:shadow-2xl hover:shadow-purple-500/10">
                <div class="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span class="text-2xl">🎨</span>
                </div>
                <p class="text-xl font-semibold text-white">Генерация изображений</p>
                <p class="text-gray-400 leading-relaxed">
                    Создавайте уникальные изображения по описанию с помощью продвинутых нейросетей
                </p>
                <div class="mt-auto text-purple-400 text-sm font-medium">
                    GPT-5 Image · Высокое качество
                </div>
            </div>

            <div class="group relative transition-all duration-500 hover:-translate-y-3 flex flex-col gap-4 rounded-2xl bg-[#201e18] border border-white/20 hover:border-green-500/30 p-6 text-center hover:shadow-2xl hover:shadow-green-500/10">
                <div class="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span class="text-2xl">📁</span>
                </div>
                <p class="text-xl font-semibold text-white">Работа с файлами</p>
                <p class="text-gray-400 leading-relaxed">
                    Загружайте документы, изображения и получайте их интеллектуальный анализ и обработку
                </p>
                <div class="mt-auto text-green-400 text-sm font-medium">
                    PDF · Word · Изображения · Текст
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/* название и язык страницы */
useSeoMeta({
    title: 'Главная',
    lang: 'ru'
})


/* проверка входа */
const userStore = useUserStore()
</script>