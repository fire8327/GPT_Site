<template>
    <header class="w-full py-4 grid-container">
        <div class="flex items-center justify-between">
            <NuxtLink to="/"
                class="flex items-center gap-2 text-blue-500 transition-all duration-500 hover:opacity-70">
                <Icon class="text-3xl" name="si:ai-fill"/>
                <span class="text-xl font-mono font-semibold">Fire AI</span>
            </NuxtLink>
            <div class="flex items-center gap-4">
                <NuxtLink v-if="userStore.authenticated" to="/chat" class="px-4 py-1.5 rounded-xl font-semibold bg-[#201e18]">Чат</NuxtLink>
                <NuxtLink to="/login" class="rounded-full border border-white/20 shadow-md flex items-center justify-center p-1 transition-all duration-500 hover:scale-105">
                    <Icon class="text-3xl" name="iconamoon:profile-bold"/>
                </NuxtLink>
            </div>
        </div>

        <!-- сообщения -->
        <button type="button" @click="messageTitle = null"
            class="fixed lg:top-10 right-4 top-4 z-[11] cursor-pointer flex items-center gap-2 px-4 py-1 text-base rounded-xl w-fit font-medium font-mono border-white border bg-[#2C2C2C] shadow-[0px_0px_13px_-7px_black]"
            :class="messageType ? 'text-white' : 'text-red-500'" v-if="messageTitle">
            <Icon class="text-2xl" name="material-symbols:close-small-rounded" />
            <span>{{ messageTitle }}</span>
        </button>
    </header>
</template>

<script setup>
/* открытие мобильного меню */
const isMenuShow = ref(false) 


/* закрытие мобильного меню */
const nuxtApp = useNuxtApp()
nuxtApp.hook('page:start', () => {
    isMenuShow.value = false
})


/* создание сообщений */
const { messageTitle, messageType } = storeToRefs(useMessagesStore())


/* проверка входа */
const userStore = useUserStore()
</script>