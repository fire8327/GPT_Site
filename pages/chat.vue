<template>
    <div class="h-screen flex flex-col">
        <div class="flex items-center justify-between border-b border-white/20 pb-4">
            <button @click="isPanelShow = !isPanelShow" class="cursor-pointer flex max-md:hidden">
                <Icon class="text-3xl" name="material-symbols:menu-rounded"/>
            </button>
            <div class="flex items-center gap-4">
                <button class="cursor-pointer flex items-center gap-2 rounded-xl p-2 border border-white/20 transition-all duration-500 bg-[#201e18]">
                    <Icon class="text-3xl" name="cuida:text-outline"/>
                    <span class="text-xl font-mono font-semibold">Текст</span>   
                </button>
                <button class="cursor-pointer flex items-center gap-2 rounded-xl p-2 border border-white/20 transition-all duration-500">
                    <Icon class="text-3xl" name="material-symbols:image"/>
                    <span class="text-xl font-mono font-semibold">Изображения</span>   
                </button>
            </div>
        </div>
        <div :class="{'gap-8' : isPanelShow}" class="flex max-md:flex-col grow">
            <div :class="isPanelShow
                ? 'md:w-1/3 lg:w-[30%] pt-4 pr-4 border-r border-white/20 opacity-100'
                : 'w-0 md:w-0 lg:w-0 pr-0 border-r-0 opacity-0 pointer-events-none'"
                class="w-full max-md:hidden overflow-hidden flex-none flex flex-col gap-4 transition-all duration-500">
                <div class="flex items-center gap-4 justify-between">
                    <p class="text-xl font-mono font-semibold">Диалоги</p>
                    <button class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                        <Icon class="text-xl text-[#14120B]" name="ic:round-plus"/>
                    </button>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="px-4 py-1.5 flex w-full text-left rounded-xl border border-white/20 line-clamp-1 transition-all duration-500 bg-[#201e18]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque consequatur repellendus libero architecto aliquam maiores sed ipsa ratione. Sed distinctio at dolores aliquid numquam perferendis consectetur voluptate nisi ipsum maxime?</button>
                    <button class="px-4 py-1.5 flex w-full text-left rounded-xl border border-white/20 line-clamp-1 transition-all duration-500">Название диалога 2</button>
                </div>
            </div>
            <div class="grow flex flex-col gap-4 h-full">
                <div class="flex flex-col gap-6 grow bg-red-500 mt-4 relative overflow-x-auto"></div>
                <div class="relative w-full">
                    <textarea placeholder="Попроси ИИ решить твою проблему..." class="text-sm p-4 pr-16 rounded-xl border border-white/20 w-full"></textarea>
                    <div class="flex items-center gap-2 absolute bottom-4 right-4">
                        <button class="cursor-pointer flex">
                            <Icon class="text-2xl" name="ant-design:paper-clip-outlined"/>
                        </button>
                        <button class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                            <Icon class="text-xl text-[#14120B]" name="line-md:arrow-up"/>
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-2 items-center text-center">
                    <p class="text-base font-mono font-medium text-gray-400">Попробуйте эти примеры для начала</p>
                    <div class="flex items-center flex-wrap gap-4 text-sm font-medium">
                        <button class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                            <Icon class="text-2xl" name="line-md:question"/>
                            <span>Что такое ...</span>
                        </button>
                        <button class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                            <Icon class="text-2xl" name="akar-icons:pencil"/>
                            <span>Напиши документацию</span>
                        </button>
                        <button class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                            <Icon class="text-2xl" name="material-symbols-light:blur-short-rounded"/>
                            <span>Объясни кратко</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/* показ боковой панели */
const isPanelShow = ref(true)
</script>