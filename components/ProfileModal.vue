<template>
    <div v-if="isOpen" @click="onClose" class="fixed inset-0 bg-black/3 backdrop-blur-[3px] z-[3]"></div>
    <div v-if="isOpen" class="fixed w-[calc(100%-30px)] z-[4] md:w-1/2 lg:w-3/5 top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 p-4 rounded-xl border border-white/20 bg-[#222222] flex flex-col gap-4">
        <button @click="onClose" class="absolute top-4 right-4 cursor-pointer rounded-full bg-[#14120B] p-1 flex items-center justify-center">
            <Icon class="text-xl" name="material-symbols:close-rounded"/>
        </button>
        <slot/>
    </div>
</template>

<script setup>
/* показ модалки */
// определяем props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

// определяем emits
const emit = defineEmits(['close'])

// Функция для закрытия
const onClose = () => {
  emit('close')
}
</script>