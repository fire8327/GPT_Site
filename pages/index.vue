<template>
    <div class="relative min-h-screen overflow-hidden">
        <!-- Анимированный фон -->
        <div ref="particles" class="absolute inset-0 z-0"></div>
        
        <div class="relative z-10">
            <!-- Главный заголовок с анимацией -->
            <div ref="heroSection" class="flex flex-col gap-8 text-center py-20">
                <p ref="mainTitle" class="text-4xl md:text-6xl font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent opacity-0">
                    Ваш AI-помощник для учёбы и работы
                </p>
                
                <p ref="subtitle" class="max-w-2xl text-lg text-gray-300 mx-auto leading-relaxed opacity-0">
                    Общайтесь с умным ассистентом, создавайте изображения, загружайте файлы и получайте помощь в любых вопросах
                </p>
                
                <div ref="ctaButton" class="opacity-0">
                    <NuxtLink :to="userStore.authenticated ? '/chat' : '/login'" class="group relative flex items-center gap-2 rounded-xl px-8 py-3 w-fit mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        <span class="font-semibold text-white">🚀 Начать</span>
                        <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </NuxtLink>
                </div>
                
                <div ref="featuresList" class="flex flex-wrap justify-center gap-6 mt-4 text-sm text-gray-400 opacity-0">
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

            <!-- Анимированные карточки -->
            <div ref="cardsSection" class="flex flex-col gap-12 py-16 px-4 max-w-6xl mx-auto">
                <div ref="sectionTitle" class="text-center opacity-0">
                    <p class="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
                        Возможности платформы
                    </p>
                    <p class="text-gray-400 max-w-2xl mx-auto">
                        Все инструменты для продуктивной работы и обучения в одном месте
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div v-for="(card, index) in featureCards" 
                         :key="index" 
                         :ref="el => cardRefs[index] = el"
                         class="group relative transition-all duration-500 hover:-translate-y-3 flex flex-col gap-4 rounded-2xl bg-[#201e18] border border-white/20 hover:border-blue-500/30 p-6 text-center hover:shadow-2xl hover:shadow-blue-500/10 opacity-0">
                        <div class="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span class="text-2xl">{{ card.icon }}</span>
                        </div>
                        <p class="text-xl font-semibold text-white">{{ card.title }}</p>
                        <p class="text-gray-400 leading-relaxed">
                            {{ card.description }}
                        </p>
                        <div class="mt-auto text-blue-400 text-sm font-medium">
                            {{ card.features }}
                        </div>
                    </div>
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

/* Рефы для анимаций */
const mainTitle = ref(null)
const subtitle = ref(null)
const ctaButton = ref(null)
const featuresList = ref(null)
const sectionTitle = ref(null)
const cardRefs = ref([])

/* Данные карточек */
const featureCards = [
    {
        icon: '💬',
        title: 'Умный чат',
        description: 'Общайтесь с AI на любые темы, получайте развернутые ответы и помощь в решении задач',
        features: 'GPT-4o Mini · Мгновенные ответы'
    },
    {
        icon: '🎨',
        title: 'Генерация изображений',
        description: 'Создавайте уникальные изображения по описанию с помощью продвинутых нейросетей',
        features: 'GPT-5 Image · Высокое качество'
    },
    {
        icon: '📁',
        title: 'Работа с файлами',
        description: 'Загружайте документы, изображения и получайте их интеллектуальный анализ и обработку',
        features: 'PDF · Word · Изображения · Текст'
    }
]

/* Создание частиц для фона */
const particles = ref(null)
const createParticles = () => {
    if (!particles.value) return
    
    const particleCount = 50
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'absolute rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20'
        
        // Случайные параметры
        const size = Math.random() * 4 + 1
        const posX = Math.random() * 100
        const posY = Math.random() * 100
        
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${posX}%`
        particle.style.top = `${posY}%`
        
        particles.value.appendChild(particle)
        
        // Анимация частицы с использованием $anime
        const { $anime } = useNuxtApp()
        $anime({
            targets: particle,
            translateX: () => $anime.random(-100, 100),
            translateY: () => $anime.random(-100, 100),
            duration: () => $anime.random(15000, 30000),
            easing: 'easeInOutSine',
            loop: true,
            direction: 'alternate'
        })
    }
}

/* Основная анимация страницы */
const runAnimations = () => {
    const { $anime } = useNuxtApp()
    
    // Последовательная анимация элементов героя
    const heroTimeline = $anime.timeline({
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
    })
    
    heroTimeline
        .add({
            targets: mainTitle.value,
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 1200
        })
        .add({
            targets: subtitle.value,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1000
        }, '-=800')
        .add({
            targets: ctaButton.value,
            opacity: [0, 1],
            translateY: [20, 0],
            scale: [0.9, 1]
        }, '-=600')
        .add({
            targets: featuresList.value,
            opacity: [0, 1],
            translateY: [10, 0]
        }, '-=400')

    // Анимация секции с карточками
    const cardsTimeline = $anime.timeline({
        delay: 1000
    })
    
    cardsTimeline
        .add({
            targets: sectionTitle.value,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutCubic'
        })
        .add({
            targets: cardRefs.value,
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.8, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .8)',
            delay: $anime.stagger(200)
        })

    // Пульсирующая анимация для CTA кнопки
    $anime({
        targets: ctaButton.value,
        scale: [1, 1.05],
        duration: 2000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    })

}

onMounted(() => {
    createParticles()
    
    // Запуск анимаций после загрузки страницы
    setTimeout(runAnimations, 500)
    
    // Анимация при скролле
    if (process.client) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const { $anime } = useNuxtApp()
                    $anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 800,
                        easing: 'easeOutCubic'
                    })
                }
            })
        }, { threshold: 0.1 })
        
    }
})
</script>

<style scoped>
/* Дополнительные стили для улучшения анимаций */
.absolute {
    will-change: transform;
}

/* Плавный скролл */
html {
    scroll-behavior: smooth;
}
</style>