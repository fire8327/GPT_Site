<template>
    <div class="h-screen flex flex-col overflow-hidden">
        <!-- Хедер с кнопками режимов -->
        <div class="flex items-center justify-between border-b border-white/20 pb-3 md:pb-4 px-2 md:px-0 flex-shrink-0">
            <!-- Мобильная кнопка меню -->
            <button @click="isMobilePanelShow = !isMobilePanelShow" class="cursor-pointer flex md:hidden">
                <Icon class="text-2xl md:text-3xl" name="material-symbols:menu-rounded"/>
            </button>
            <button @click="isPanelShow = !isPanelShow" class="cursor-pointer hidden md:flex">
                <Icon class="text-3xl" name="material-symbols:menu-rounded"/>
            </button>
            <div class="flex items-center gap-2 md:gap-4">
                <button @click="chatMode = 'text'" :class="chatMode === 'text' ? 'bg-[#201e18]' : ''" class="cursor-pointer flex items-center gap-1.5 md:gap-2 rounded-xl p-1.5 md:p-2 border border-white/20 transition-all duration-500">
                    <Icon class="text-xl md:text-3xl" name="cuida:text-outline"/>
                    <span class="text-sm md:text-xl font-mono font-semibold">Текст</span>   
                </button>
                <button @click="chatMode = 'image'" :class="chatMode === 'image' ? 'bg-[#201e18]' : ''" class="cursor-pointer flex items-center gap-1.5 md:gap-2 rounded-xl p-1.5 md:p-2 border border-white/20 transition-all duration-500">
                    <Icon class="text-xl md:text-3xl" name="material-symbols:image"/>
                    <span class="text-sm md:text-xl font-mono font-semibold max-md:hidden">Изображения</span>   
                </button>
            </div>
        </div>
        
        <!-- Мобильная панель диалогов -->
        <div v-if="isMobilePanelShow" class="md:hidden border-b border-white/20 pb-4 px-4 flex-shrink-0 max-h-[40vh] overflow-y-auto custom-scrollbar">
            <div class="flex items-center gap-4 justify-between py-4">
                <p class="text-lg font-mono font-semibold">Диалоги</p>
                <button @click="createNewDialog" class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                    <Icon class="text-xl text-[#14120B]" name="ic:round-plus"/>
                </button>
            </div>
            <div class="flex flex-col gap-2">
                <div 
                    v-for="dialog in dialogs" 
                    :key="dialog.id"
                    :class="currentDialogId === dialog.id ? 'bg-[#201e18]' : ''"
                    class="group flex items-center gap-2 px-4 py-1.5 rounded-xl border border-white/20 transition-all duration-500 hover:bg-[#201e18]">
                    <button 
                        @click="switchDialog(dialog.id); isMobilePanelShow = false"
                        class="flex-1 text-left line-clamp-1 cursor-pointer text-sm">
                        {{ dialog.title || `Диалог ${dialog.id}` }}
                    </button>
                    <button 
                        @click.stop="deleteDialog(dialog.id)"
                        class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer flex">
                        <Icon class="text-lg text-red-400" name="material-symbols:delete-outline"/>
                    </button>
                </div>
                <p v-if="dialogs.length === 0" class="text-center text-gray-400 text-xs py-4">Нет диалогов</p>
            </div>
        </div>
        
        <!-- Основной контент -->
        <div :class="{'gap-4 md:gap-8' : isPanelShow}" class="flex max-md:flex-col grow min-h-0 overflow-hidden">
            <!-- Десктопная панель диалогов -->
            <div :class="isPanelShow
                ? 'md:w-1/3 lg:w-[30%] pt-4 pr-4 border-r border-white/20 opacity-100'
                : 'w-0 md:w-0 lg:w-0 pr-0 border-r-0 opacity-0 pointer-events-none'"
                class="w-full max-md:hidden overflow-hidden flex-none flex flex-col gap-4 transition-all duration-500 min-h-0">
                <div class="flex items-center gap-4 justify-between flex-shrink-0">
                    <p class="text-xl font-mono font-semibold">Диалоги</p>
                    <button @click="createNewDialog" class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                        <Icon class="text-xl text-[#14120B]" name="ic:round-plus"/>
                    </button>
                </div>
                <div class="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    <div 
                        v-for="dialog in dialogs" 
                        :key="dialog.id"
                        :class="currentDialogId === dialog.id ? 'bg-[#201e18]' : ''"
                        class="group flex items-center gap-2 px-4 py-1.5 rounded-xl border border-white/20 transition-all duration-500 hover:bg-[#201e18]">
                        <button 
                            @click="switchDialog(dialog.id)"
                            class="flex-1 text-left line-clamp-1 cursor-pointer">
                            {{ dialog.title || `Диалог ${dialog.id}` }}
                        </button>
                        <button 
                            @click.stop="deleteDialog(dialog.id)"
                            class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex">
                            <Icon class="text-xl text-red-400" name="material-symbols:delete-outline"/>
                        </button>
                    </div>
                    <p v-if="dialogs.length === 0" class="text-center text-gray-400 text-sm py-4">Нет диалогов</p>
                </div>
            </div>
            
            <!-- Блок сообщений и ввода -->
            <div class="grow flex flex-col gap-2 md:gap-4 min-h-0 overflow-hidden">
                <div ref="messagesContainer" class="flex flex-col gap-4 md:gap-6 flex-1 overflow-y-auto custom-scrollbar px-2 md:px-0 pt-2 md:pt-4 pb-2 relative min-h-0">
                    <div v-if="messages.length === 0 && chatMode === 'text' && dialogs.length > 0" class="flex items-center justify-center h-full">
                        <div class="flex flex-col gap-2 md:gap-4 items-center text-center px-4">
                            <p class="text-sm md:text-base font-mono font-medium text-gray-400">Попробуйте эти примеры для начала</p>
                            <div class="flex items-center flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                                <button @click="sendExampleMessage('Что такое искусственный интеллект?')" class="flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-xl md:text-2xl" name="line-md:question"/>
                                    <span class="hidden sm:inline">Что такое ...</span>
                                    <span class="sm:hidden">Что такое?</span>
                                </button>
                                <button @click="sendExampleMessage('Напиши документацию для моего проекта')" class="flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-xl md:text-2xl" name="akar-icons:pencil"/>
                                    <span class="hidden sm:inline">Напиши документацию</span>
                                    <span class="sm:hidden">Документация</span>
                        </button>
                                <button @click="sendExampleMessage('Объясни кратко принцип работы нейронных сетей')" class="flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-xl md:text-2xl" name="material-symbols-light:blur-short-rounded"/>
                                    <span class="hidden sm:inline">Объясни кратко</span>
                                    <span class="sm:hidden">Объясни</span>
                        </button>
                    </div>
                </div>
                    </div>
                    <div v-if="messages.length === 0 && chatMode === 'image'" class="flex items-center justify-center h-full">
                        <div class="flex flex-col gap-2 items-center text-center px-4">
                            <p class="text-sm md:text-base font-mono font-medium text-gray-400">Режим генерации изображений</p>
                            <p class="text-xs md:text-sm text-gray-500">Опишите изображение в поле ввода ниже, и ИИ сгенерирует его для вас</p>
                </div>
            </div>
                    <div v-for="msg in messages" :key="msg.id" class="flex w-full group px-1"
                        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        <div :class="msg.role === 'user' 
                            ? 'bg-white text-[#14120B]' 
                            : 'bg-[#201e18] border border-white/20'"
                            class="max-w-[85%] md:max-w-[80%] rounded-xl p-3 md:p-4 text-xs md:text-sm break-words overflow-hidden">
                            <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 w-full min-w-0">
                                <!-- Отображение сгенерированного изображения -->
                                <div v-if="msg.generatedImage" class="flex-1 min-w-0">
                                    <div class="relative group/image">
                                        <img 
                                            :src="msg.generatedImage" 
                                            :alt="msg.content || 'Сгенерированное изображение'"
                                            class="max-w-full rounded-lg border border-white/20"
                                            @error="handleImageError">
                                        <button
                                            @click="downloadGeneratedImage(msg.generatedImage, getImageFilename(msg.content))"
                                            class="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-[#14120B] rounded-lg p-2 cursor-pointer hover:bg-[#201e18] border border-white/20 flex"
                                            title="Скачать изображение">
                                            <Icon class="text-lg text-white" name="material-symbols:download"/>
                                        </button>
                                    </div>
                                </div>
                                <!-- Обычное текстовое сообщение -->
                                <div v-else class="flex-1 min-w-0 formatted-message [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_code]:text-[10px] md:[&_code]:text-xs [&_code]:break-all [&_pre]:my-2 [&_pre]:whitespace-pre [&_pre]:overflow-x-auto [&_pre]:custom-scrollbar [&_pre]:max-w-full [&_pre]:min-w-0 [&_pre_code]:block [&_pre_code]:text-[10px] md:[&_pre_code]:text-xs [&_pre_code]:break-all [&_pre_code]:max-w-full [&_h1]:text-lg md:[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:block [&_h1]:break-words [&_h2]:text-base md:[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:block [&_h2]:break-words [&_h3]:text-sm md:[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:block [&_h3]:break-words [&_ul]:block [&_ul]:break-words [&_ol]:block [&_ol]:break-words [&_li]:break-words [&_p]:break-words [&_a]:underline [&_a]:text-blue-400 [&_a:hover]:text-blue-300 [&_a]:break-all" v-html="formatMessage(msg.content)"></div>
                                <button 
                                    v-if="!msg.generatedImage"
                                    @click="copyMessage(msg.content)"
                                    class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-1 hover:bg-white/10 rounded"
                                    title="Копировать">
                                    <Icon class="text-base md:text-lg" name="material-symbols:content-copy-outline"/>
                                </button>
                            </div>
                            <div v-else class="whitespace-pre-wrap break-words">
                                <div v-if="getMessageText(msg.content)">{{ getMessageText(msg.content) }}</div>
                                <!-- Отображение прикрепленных файлов -->
                                <div v-if="msg.files && msg.files.length > 0" class="mt-2 pt-2 border-t border-white/10">
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="(file, index) in msg.files" 
                                            :key="index"
                                            @click="downloadFile(file)"
                                            class="flex items-center gap-1.5 text-[10px] transition-colors cursor-pointer group">
                                            <Icon class="text-xs text-blue-400 group-hover:text-blue-300" name="material-symbols:attach-file"/>
                                            <span class="truncate max-w-[100px] md:max-w-[150px]">{{ file.name }}</span>
                                            <span class="text-gray-400">({{ formatFileSize(file.size) }})</span>
                                            <Icon class="text-xs text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" name="material-symbols:download"/>
                        </button>
                                    </div>
                                </div>
                            </div>
                            <p class="text-[10px] md:text-xs mt-1.5 md:mt-2 opacity-60">{{ formatTime(msg.created_at) }}</p>
                        </div>
                    </div>
                    <div v-if="isLoading[currentDialogId] || (isGeneratingImage && chatMode === 'image')" class="flex justify-start px-1">
                        <div class="bg-[#201e18] border border-white/20 rounded-xl p-3 md:p-4 text-xs md:text-sm flex items-center gap-2">
                            <Icon class="text-lg md:text-xl animate-spin" name="line-md:loading-loop"/>
                            <span>Думаю...</span>
                        </div>
                    </div>
                </div>
                
                <!-- Поле ввода -->
                <div v-if="chatMode === 'text'" class="relative w-full flex-none group px-2 md:px-0 pb-2 md:pb-0">
                    <!-- Список прикрепленных файлов -->
                    <div v-if="attachedFiles.length > 0" class="flex flex-wrap gap-2 mb-2 px-1">
                        <div 
                            v-for="(file, index) in attachedFiles" 
                            :key="index"
                            class="flex items-center gap-2 bg-[#201e18] border border-white/20 rounded-lg px-2 py-1.5 text-xs">
                            <Icon class="text-sm" name="material-symbols:attach-file"/>
                            <span class="max-w-[150px] md:max-w-[200px] truncate">{{ file.name }}</span>
                            <span class="text-gray-400 text-[10px]">({{ formatFileSize(file.size) }})</span>
                            <button 
                                @click="removeFile(index)"
                                class="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors flex cursor-pointer"
                                title="Удалить файл">
                                <Icon class="text-sm text-red-400" name="material-symbols:close"/>
                        </button>
                    </div>
                </div>
                    
                    <!-- Скрытый input для файлов -->
                    <input 
                        ref="fileInputRef"
                        type="file"
                        multiple
                        @change="handleFileSelect"
                        class="hidden"
                        accept="*/*">
                    
                    <textarea 
                        ref="textareaInput"
                        v-model="currentMessage"
                        @input="autoResizeTextarea"
                        @keydown.enter="handleSendMessage"
                        placeholder="Попроси ИИ решить твою проблему..." 
                        class="text-xs md:text-sm p-3 md:p-4 pr-16 md:pr-20 rounded-xl border border-white/20 w-full bg-[#14120B] resize-none overflow-hidden focus:outline-none"
                        style="min-height: 44px; max-height: 150px;"></textarea>
                    <div class="flex items-center gap-1.5 md:gap-2 absolute bottom-5 right-5 md:bottom-4 md:right-4">
                        <button 
                            @click="handleFileAttach"
                            class="cursor-pointer flex items-center justify-center"
                            title="Прикрепить файл">
                            <Icon class="text-xl md:text-2xl" name="ant-design:paper-clip-outlined"/>
                        </button>
                        <button @click="sendMessage" 
                            :disabled="isLoading[currentDialogId] || (!currentMessage.trim() && attachedFiles.length === 0)"
                            :class="isLoading[currentDialogId] || (!currentMessage.trim() && attachedFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : ''"
                            class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                            <Icon class="text-lg md:text-xl text-[#14120B]" name="line-md:arrow-up"/>
                        </button>
                    </div>
                </div>
                <div v-if="chatMode === 'image'" class="relative w-full flex-none px-2 md:px-0 pb-2 md:pb-0">
                    <div class="flex flex-col gap-3 md:gap-4">
                        <!-- Выбор формата (соотношения сторон) -->
                        <div class="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                            <span class="text-gray-400">Формат:</span>
                            <button 
                                v-for="format in [{ratio: '1:1', label: '1:1'}, {ratio: '16:9', label: '16:9'}, {ratio: '9:16', label: '9:16'}, {ratio: '4:3', label: '4:3'}, {ratio: '21:9', label: '21:9'}]" 
                                :key="format.ratio"
                                @click="imageSize = format.ratio"
                                :class="imageSize === format.ratio ? 'bg-white text-[#14120B]' : 'bg-[#201e18] border border-white/20'"
                                class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                {{ format.label }}
                            </button>
                        </div>
                        
                        <!-- Поле ввода промпта -->
                        <div class="relative">
                            <textarea 
                                ref="imagePromptInput"
                                v-model="imagePrompt"
                                @keydown.enter="generateImage"
                                placeholder="Опишите изображение, которое хотите сгенерировать..." 
                                class="text-xs md:text-sm p-3 md:p-4 pr-16 md:pr-20 rounded-xl border border-white/20 w-full bg-[#14120B] resize-none overflow-hidden focus:outline-none"
                                style="min-height: 80px; max-height: 150px;"></textarea>
                            <button 
                                @click="generateImage" 
                                :disabled="isGeneratingImage || !imagePrompt.trim()"
                                :class="isGeneratingImage || !imagePrompt.trim() ? 'opacity-50 cursor-not-allowed' : ''"
                                class="absolute bottom-3 md:bottom-4 right-3 md:right-4 cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                                <Icon v-if="isGeneratingImage" class="text-lg md:text-xl text-[#14120B] animate-spin" name="line-md:loading-loop"/>
                                <Icon v-else class="text-lg md:text-xl text-[#14120B]" name="line-md:arrow-up"/>
                        </button>
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
    title: 'Чат с ИИ',
    lang: 'ru'
})

/* показ боковой панели */
const isPanelShow = ref(true)
const isMobilePanelShow = ref(false)

/* подключение хранилищ и бд */
const { id, authenticated } = useUserStore()
const { showMessage } = useMessagesStore()
const supabase = useSupabaseClient()

/* состояния */
const messages = ref([])
const currentMessage = ref('')
const isLoading = ref({}) // Объект для отслеживания загрузки по dialogId
const currentDialogId = ref(1)
const dialogs = ref([])
const messagesContainer = ref(null)
const textareaInput = ref(null)
const chatMode = ref('text') // 'text' или 'image'
const attachedFiles = ref([])
const fileInputRef = ref(null)
const imagePrompt = ref('')
const imageSize = ref('1:1') // Формат по умолчанию (квадрат)
const isGeneratingImage = ref(false)
const imagePromptInput = ref(null)

/* первоначальная загрузка */
onMounted(async () => {
    // Middleware уже проверяет авторизацию, просто логируем для отладки
    console.log('Chat mounted', { 
        authenticated: authenticated, 
        id: id 
    })
    
    // Даем небольшую задержку для синхронизации cookie если нужно
    await nextTick()
    
    await loadDialogs()
    // loadMessages вызывается внутри loadDialogs, если выбран первый диалог
    // Иначе загружаем сообщения для текущего диалога
    if (dialogs.value.length === 0 || currentDialogId.value) {
        await loadMessages()
    }
})

/* загрузка диалогов */
const loadDialogs = async () => {
    if (!id) {
        console.error('Cannot load dialogs: userId is missing')
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('website_conversations')
            .select('dialog_id, role, content, created_at')
            .eq('website_user_id', id)
            .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Группируем по dialog_id и получаем первый вопрос каждого диалога
        const dialogMap = new Map()
        data.forEach(msg => {
            if (msg.role === 'user' && !dialogMap.has(msg.dialog_id)) {
                dialogMap.set(msg.dialog_id, {
                    id: msg.dialog_id,
                    title: msg.content.length > 40 ? msg.content.substring(0, 40) + '...' : msg.content
                })
            }
        })
        
        dialogs.value = Array.from(dialogMap.values())
        
        // Автоматически открываем первый (самый верхний) диалог, если текущий не установлен
        if (dialogs.value.length > 0 && (!currentDialogId.value || currentDialogId.value === 1)) {
            const firstDialog = dialogs.value[0]
            if (firstDialog && firstDialog.id !== currentDialogId.value) {
                currentDialogId.value = firstDialog.id
                await loadMessages()
            }
        }
    } catch (error) {
        console.error('Error loading dialogs:', error)
    }
}

/* загрузка сообщений */
const loadMessages = async () => {
    if (!id) {
        console.error('Cannot load messages: userId is missing')
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('website_conversations')
            .select('*')
            .eq('website_user_id', id)
            .eq('dialog_id', currentDialogId.value)
            .order('created_at', { ascending: true })
        
        if (error) throw error
        
        // Восстанавливаем файлы из JSONB и сгенерированные изображения если они есть
        // Supabase автоматически распарсит jsonb в объект/массив
        messages.value = (data || []).map(msg => {
            // Если files это строка (старый формат), пытаемся распарсить
            if (msg.files && typeof msg.files === 'string') {
                try {
                    msg.files = JSON.parse(msg.files)
                } catch (e) {
                    console.error('Error parsing files:', e)
                    msg.files = null
                }
            }
            // Если есть сгенерированное изображение, добавляем его
            if (msg.generated_image) {
                msg.generatedImage = msg.generated_image
            }
            // Если files уже объект/массив (jsonb), оставляем как есть
            return msg
        })
        
        // Автопрокрутка вниз после загрузки
        nextTick(() => {
            scrollToBottom()
        })
    } catch (error) {
        console.error('Error loading messages:', error)
    }
}

/* прокрутка вниз */
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

/* создание нового диалога */
const createNewDialog = async () => {
    if (dialogs.value.length >= 5) {
        return showMessage('Достигнут лимит диалогов (5)', false)
    }
    
    // Находим первый свободный dialog_id
    const existingIds = dialogs.value.map(d => d.id)
    let newId = 1
    while (existingIds.includes(newId) && newId <= 5) {
        newId++
    }
    
    currentDialogId.value = newId
    messages.value = []
    currentMessage.value = ''
    
    // Обновляем список диалогов (добавляем новый пустой диалог в список)
    dialogs.value.push({
        id: newId,
        title: 'Новый диалог'
    })
    
    // Сортируем диалоги по ID
    dialogs.value.sort((a, b) => a.id - b.id)
    
    showMessage(`Создан новый диалог №${newId}`, true)
}

/* переключение диалога */
const switchDialog = async (dialogId) => {
    // Останавливаем загрузку для старого диалога если она была
    if (isLoading.value[currentDialogId.value]) {
        isLoading.value[currentDialogId.value] = false
    }
    currentDialogId.value = dialogId
    await loadMessages()
}

/* удаление диалога */
const deleteDialog = async (dialogId) => {
    if (!id) {
        return showMessage('Ошибка: пользователь не авторизован', false)
    }
    
    if (dialogId === currentDialogId.value) {
        return showMessage('Сначала переключитесь на другой диалог', false)
    }
    
    try {
        const { error } = await supabase
            .from('website_conversations')
            .delete()
            .eq('website_user_id', id)
            .eq('dialog_id', dialogId)
        
        if (error) throw error
        
        await loadDialogs()
        showMessage('Диалог удалён', true)
    } catch (error) {
        console.error('Error deleting dialog:', error)
        showMessage('Ошибка при удалении диалога', false)
    }
}

/* конвертация файла в base64 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/* отправка сообщения */
const sendMessage = async () => {
    if ((!currentMessage.value.trim() && attachedFiles.value.length === 0) || isLoading.value[currentDialogId.value]) return
    
    const userMessage = currentMessage.value.trim()
    const filesToSend = [...attachedFiles.value]
    
    // Очищаем поля
    currentMessage.value = ''
    attachedFiles.value = []
    
    // Проверяем что userId существует перед отправкой
    if (!id || !authenticated) {
        showMessage('Ошибка: пользователь не авторизован. Пожалуйста, войдите снова.', false)
        console.error('User ID missing:', { 
            id: id, 
            authenticated: authenticated 
        })
        await navigateTo('/login')
        return
    }
    
    // Формируем контент сообщения (без информации о файлах, так как они будут проанализированы ИИ)
    let messageContent = userMessage
    // Если есть файлы но нет текста, добавляем минимальное описание
    if (filesToSend.length > 0 && !userMessage) {
        const hasTextFiles = filesToSend.some(f => 
            f.type.startsWith('text/') || 
            f.type === 'application/json' ||
            f.name.match(/\.(txt|md|js|ts|jsx|tsx|vue|py|java|cpp|c|h|css|html|xml|json|yaml|yml|sh|bash|sql|log)$/i)
        )
        const hasImages = filesToSend.some(f => f.type.startsWith('image/'))
        
        if (hasTextFiles) {
            messageContent = 'Проанализируй прикрепленные файлы'
        } else if (hasImages) {
            messageContent = 'Проанализируй прикрепленные изображения'
        } else {
            messageContent = 'Файлы прикреплены'
        }
    }
    
    // Конвертируем файлы в base64 для сохранения
    const filesDataForUI = filesToSend.length > 0 ? await Promise.all(
        filesToSend.map(async (file) => {
            const base64 = await fileToBase64(file)
            return {
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            }
        })
    ) : null
    
    // Добавляем сообщение пользователя в UI
    messages.value.push({
        id: Date.now(),
        role: 'user',
        content: messageContent,
        website_user_id: id,
        dialog_id: currentDialogId.value,
        created_at: new Date().toISOString(),
        files: filesDataForUI
    })
    
    isLoading.value[currentDialogId.value] = true
    
    try {
        // Обрабатываем файлы: читаем содержимое текстовых файлов и конвертируем изображения
        const filesData = await Promise.all(
            filesToSend.map(async (file) => {
                const base64 = await fileToBase64(file)
                const fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64
                }
                
                // Определяем тип файла и читаем содержимое если это текст/код (исключая SVG, обрабатывается отдельно)
                if ((file.type.startsWith('text/') || 
                    file.type === 'application/json' ||
                    file.name.match(/\.(txt|md|js|ts|jsx|tsx|vue|py|java|cpp|c|h|css|html|xml|json|yaml|yml|sh|bash|sql|log)$/i)) &&
                    !file.name.match(/\.svg$/i)) {
                    try {
                        // Читаем содержимое текстового файла
                        const text = await file.text()
                        fileInfo.content = text
                        fileInfo.isText = true
                        fileInfo.isSupported = true
                    } catch (e) {
                        console.error('Error reading text file:', e)
                        fileInfo.isSupported = false
                        fileInfo.unsupportedReason = 'Не удалось прочитать содержимое файла'
                    }
                }
                // Определяем изображения (исключая SVG, так как он может обрабатываться отдельно)
                else if (file.type.startsWith('image/') && !file.name.match(/\.svg$/i)) {
                    // Проверяем размер изображения (макс 20MB для base64)
                    if (file.size > 20 * 1024 * 1024) {
                        fileInfo.isSupported = false
                        fileInfo.unsupportedReason = `Изображение слишком большое (${formatFileSize(file.size)}). Максимальный размер: 20MB`
                    } else {
                        fileInfo.isImage = true
                        fileInfo.isSupported = true
                    }
                }
                // SVG обрабатываем отдельно - это текстовый формат
                else if (file.name.match(/\.svg$/i) || file.type === 'image/svg+xml') {
                    try {
                        // SVG можно прочитать как текст
                        const text = await file.text()
                        fileInfo.content = text
                        fileInfo.isText = true
                        fileInfo.isSupported = true
                        // Также сохраняем base64 для отображения в UI
                    } catch (e) {
                        console.error('Error reading SVG file:', e)
                        fileInfo.isSupported = false
                        fileInfo.unsupportedReason = 'Не удалось прочитать SVG файл'
                    }
                }
                // Определяем неподдерживаемые форматы
                else if (file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) {
                    fileInfo.isSupported = false
                    fileInfo.unsupportedReason = `Формат файла ${file.name.split('.').pop().toUpperCase()} не поддерживается для анализа ИИ. Попробуйте конвертировать файл в текстовый формат (TXT, MD) или изображение.`
                }
                else {
                    fileInfo.isSupported = false
                    fileInfo.unsupportedReason = `Формат файла не поддерживается для анализа ИИ. Поддерживаются: текстовые файлы (TXT, MD, код), изображения (JPG, PNG, GIF, WEBP) и JSON.`
                }
                
                return fileInfo
            })
        )
        
        // Получаем историю для контекста (последние 3 пары сообщений, исключая только что добавленное сообщение пользователя)
        // messages.value уже содержит новое сообщение пользователя, но нам нужна история БЕЗ него
        const historyForContext = messages.value.slice(0, -1) // Исключаем последнее сообщение (которое мы только что добавили)
        const historyMessages = historyForContext
            .slice(-6) // Берем последние 6 сообщений (3 пары)
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        
        // Подготавливаем данные для отправки
        const requestBody = {
            message: userMessage || (filesToSend.length > 0 ? `Прикреплены файлы: ${filesToSend.map(f => f.name).join(', ')}` : ''),
            userId: String(id), // Преобразуем в строку на всякий случай
            dialogId: currentDialogId.value || 1,
            conversationHistory: historyMessages,
            files: filesData.length > 0 ? filesData : undefined
        }
        
        console.log('Sending request:', { 
            hasMessage: !!requestBody.message,
            hasUserId: !!requestBody.userId,
            userId: requestBody.userId
        })
        
        const { response } = await $fetch('/api/website/chat', {
            method: 'POST',
            body: requestBody
        }).catch(err => {
            console.error('API Error:', err)
            throw new Error(err.data?.statusMessage || err.data?.message || err.message || 'Ошибка при обращении к API')
        })
        
        // Обновляем сообщение пользователя с файлами из ответа сервера (если они были загружены)
        // И добавляем ответ AI в UI
        const lastUserMessageIndex = messages.value.length - 1
        if (lastUserMessageIndex >= 0 && messages.value[lastUserMessageIndex].role === 'user') {
            // Файлы теперь загружены в Storage, но мы уже добавили сообщение с base64
            // При следующей загрузке файлы будут со ссылками на Storage
        }
        
        // Добавляем ответ AI в UI
        messages.value.push({
            id: Date.now() + 1,
            role: 'assistant',
            content: response,
            website_user_id: id,
            dialog_id: currentDialogId.value,
            created_at: new Date().toISOString()
        })
        
        // Автоматически изменяем размер textarea после отправки
        nextTick(() => {
            autoResizeTextarea()
            // Очищаем input файлов
            if (fileInputRef.value) {
                fileInputRef.value.value = ''
            }
        })
        
        // Автопрокрутка вниз
        nextTick(() => {
            scrollToBottom()
        })
        
        // Обновляем список диалогов если это новый диалог
        if (!dialogs.value.find(d => d.id === currentDialogId.value)) {
            await loadDialogs()
        } else {
            // Обновляем название диалога на основе первого сообщения
            const dialog = dialogs.value.find(d => d.id === currentDialogId.value)
            if (dialog && dialog.title === 'Новый диалог') {
                dialog.title = userMessage.length > 40 ? userMessage.substring(0, 40) + '...' : userMessage
            }
        }
        
    } catch (error) {
        console.error('Error sending message:', error)
        
        // Показываем более детальное сообщение об ошибке
        let errorMessage = 'Ошибка при отправке сообщения'
        if (error.data?.statusMessage) {
            errorMessage = error.data.statusMessage
        } else if (error.message) {
            errorMessage = error.message
        }
        
        showMessage(errorMessage, false)
        
        // Удаляем сообщение пользователя из UI при ошибке
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'user') {
            messages.value.pop()
        }
    } finally {
        isLoading.value[currentDialogId.value] = false
    }
}

/* вставка примера в поле ввода */
const sendExampleMessage = (message) => {
    currentMessage.value = message
    // Фокусируем поле ввода после вставки примера
    nextTick(() => {
        if (textareaInput.value) {
            textareaInput.value.focus()
            // Устанавливаем курсор в конец текста
            textareaInput.value.setSelectionRange(message.length, message.length)
        }
    })
}

/* обработка Enter для отправки */
const handleSendMessage = (e) => {
    if (e.shiftKey) {
        // Shift+Enter для новой строки - разрешаем дефолтное поведение
        return
    }
    // Enter без Shift - отправляем сообщение
    e.preventDefault()
    sendMessage()
}

/* форматирование сообщения markdown */
const formatMessage = (text) => {
    if (!text) return ''
    
    let formatted = text
    
    // Сначала обрабатываем блоки кода (чтобы не форматировать их содержимое)
    const codeBlocks = []
    formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```/g, '').trim()
        const id = `CODE_BLOCK_${codeBlocks.length}`
        // Экранируем HTML в коде
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        codeBlocks.push(`<pre class="bg-black/30 p-2 md:p-3 rounded my-2 overflow-x-auto border border-white/10 custom-scrollbar max-w-full min-w-0"><code class="text-[10px] md:text-xs font-mono whitespace-pre block break-all max-w-full">${escapedCode}</code></pre>`)
        return id
    })
    
    const inlineCodes = []
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
        const id = `INLINE_CODE_${inlineCodes.length}`
        // Экранируем HTML в inline коде
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        inlineCodes.push(`<code class="bg-black/30 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-mono border border-white/10 break-all">${escapedCode}</code>`)
        return id
    })
    
    // Экранируем HTML для безопасности
    formatted = formatted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    
    // **жирный текст** (только если не внутри кода)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // *курсив*
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    
    // Восстанавливаем блоки кода
    codeBlocks.forEach((block, i) => {
        formatted = formatted.replace(`CODE_BLOCK_${i}`, block)
    })
    
    inlineCodes.forEach((code, i) => {
        formatted = formatted.replace(`INLINE_CODE_${i}`, code)
    })
    
    // Заголовки
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>')
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-5 mb-3">$1</h1>')
    
    // Списки - обрабатываем построчно
    const lines = formatted.split('\n')
    const formattedLines = []
    let inList = false
    let listType = null
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const bulletMatch = line.match(/^[-*] (.+)$/)
        const numberedMatch = line.match(/^(\d+)\. (.+)$/)
        
        if (bulletMatch || numberedMatch) {
            const itemText = bulletMatch ? bulletMatch[1] : numberedMatch[2]
            
            if (!inList || (numberedMatch && listType !== 'numbered') || (bulletMatch && listType !== 'bullet')) {
                if (inList) {
                    formattedLines.push(listType === 'numbered' ? '</ol>' : '</ul>')
                }
                listType = numberedMatch ? 'numbered' : 'bullet'
                formattedLines.push(listType === 'numbered' ? '<ol class="list-decimal ml-6 my-2 space-y-1">' : '<ul class="list-disc ml-6 my-2 space-y-1">')
                inList = true
            }
            
            const formattedItem = formatInlineMarkdown(itemText)
            formattedLines.push(`<li>${formattedItem}</li>`)
        } else {
            if (inList) {
                formattedLines.push(listType === 'numbered' ? '</ol>' : '</ul>')
                inList = false
                listType = null
            }
            formattedLines.push(formatInlineMarkdown(line))
        }
    }
    
    if (inList) formattedLines.push(listType === 'numbered' ? '</ol>' : '</ul>')
    
    // Ссылки [текст](url)
    formattedLines.forEach((line, index) => {
        formattedLines[index] = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-blue-400 hover:text-blue-300">$1</a>')
    })
    
    // Объединяем строки, добавляя переносы только между обычным текстом
    // Блочные элементы (заголовки, списки, блоки кода) обрабатываются через CSS
    let result = []
    for (let i = 0; i < formattedLines.length; i++) {
        const line = formattedLines[i]
        const nextLine = formattedLines[i + 1]
        
        // Пропускаем пустые строки в конце
        if (!line.trim() && i === formattedLines.length - 1) {
            continue
        }
        
        result.push(line)
        
        // Проверяем типы элементов
        const isBlockClose = line.match(/<\/(h[1-6]|ul|ol|pre)>/)
        const nextIsBlock = nextLine && nextLine.match(/^<(h[1-6]|ul|ol|pre|li)/)
        const isBlockOpen = line.match(/^<(h[1-6]|ul|ol|pre|li)/)
        
        // Добавляем <br> только между строками обычного текста
        if (i < formattedLines.length - 1 &&
            !isBlockClose &&
            !nextIsBlock &&
            !isBlockOpen &&
            line.trim() &&
            nextLine &&
            nextLine.trim()) {
            result.push('<br>')
        }
    }
    
    formatted = result.join('')
    
    return formatted
}

/* форматирование inline markdown (без блоков) */
const formatInlineMarkdown = (text) => {
    let formatted = text
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    return formatted
}

/* копирование сообщения с форматированием */
const copyMessage = async (text) => {
    try {
        // Копируем оригинальный текст (без HTML)
        await navigator.clipboard.writeText(text)
        showMessage('Сообщение скопировано!', true)
    } catch (err) {
        console.error('Ошибка копирования:', err)
        showMessage('Не удалось скопировать сообщение', false)
    }
}

/* форматирование времени */
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    // Если меньше минуты
    if (diff < 60000) {
        return 'только что'
    }
    
    // Если сегодня
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    
    // Если вчера
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
        return `вчера ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    // Иначе полная дата
    return date.toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    })
}

/* прикрепление файла */
const handleFileAttach = () => {
    if (fileInputRef.value) {
        fileInputRef.value.click()
    }
}

/* обработка выбора файлов */
const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return
    
    // Проверяем размер каждого файла (макс 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const invalidFiles = files.filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
        showMessage(`Файлы больше 10MB не поддерживаются. Большие файлы: ${invalidFiles.map(f => f.name).join(', ')}`, false)
        files.splice(files.indexOf(invalidFiles[0]), invalidFiles.length)
    }
    
    // Добавляем валидные файлы
    attachedFiles.value.push(...files.filter(file => file.size <= maxSize))
    
    // Очищаем input для возможности повторного выбора тех же файлов
    if (fileInputRef.value) {
        fileInputRef.value.value = ''
    }
}

/* удаление файла */
const removeFile = (index) => {
    attachedFiles.value.splice(index, 1)
}

/* форматирование размера файла */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/* получение текста сообщения без информации о файлах */
const getMessageText = (content) => {
    if (!content) return ''
    // Убираем строки с [Файл: ...] из текста
    return content.replace(/\[Файл:[^\]]+\]/g, '').trim()
}

/* скачивание файла */
const downloadFile = async (file) => {
    if (!file) {
        showMessage('Ошибка: файл недоступен для скачивания', false)
        return
    }
    
    try {
        // Если есть URL из Storage, используем его
        if (file.url) {
            // Скачиваем файл по URL
            const response = await fetch(file.url)
            if (!response.ok) {
                throw new Error('Failed to fetch file')
            }
            const blob = await response.blob()
            
            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = file.name || 'download'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } 
        // Если есть base64 данные (старые файлы), используем их
        else if (file.data) {
            const base64Data = file.data.split(',')[1] || file.data
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' })
            
            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = file.name || 'download'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } else {
            throw new Error('No file data or URL available')
        }
    } catch (error) {
        console.error('Error downloading file:', error)
        showMessage('Ошибка при скачивании файла', false)
    }
}

/* генерация изображения */
const generateImage = async () => {
    if (!imagePrompt.value.trim() || isGeneratingImage.value) return
    
    const prompt = imagePrompt.value.trim()
    imagePrompt.value = ''
    
    // Проверяем авторизацию
    if (!id || !authenticated) {
        showMessage('Ошибка: пользователь не авторизован. Пожалуйста, войдите снова.', false)
        await navigateTo('/login')
        return
    }
    
    // Добавляем запрос пользователя в UI
    messages.value.push({
        id: Date.now(),
        role: 'user',
        content: `Сгенерировать изображение: ${prompt}`,
        website_user_id: id,
        dialog_id: currentDialogId.value,
        created_at: new Date().toISOString()
    })
    
    // Автопрокрутка для сообщения пользователя
    nextTick(() => {
        scrollToBottom()
    })
    
    isGeneratingImage.value = true
    
    try {
        const requestBody = {
            prompt: prompt,
            size: imageSize.value,
            userId: String(id),
            dialogId: currentDialogId.value || 1
        }
        
        const response = await $fetch('/api/website/generate-image', {
            method: 'POST',
            body: requestBody
        }).catch(err => {
            console.error('API Error:', err)
            throw new Error(err.data?.statusMessage || err.data?.message || err.message || 'Ошибка при генерации изображения')
        })
        
        const { imageUrl, prompt: responsePrompt } = response
        
        if (!imageUrl) {
            throw new Error('Изображение не было получено от API')
        }
        
        // Добавляем ответ AI с изображением в UI
        const aiMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `Изображение сгенерировано: ${responsePrompt || prompt}`,
            website_user_id: id,
            dialog_id: currentDialogId.value,
            generatedImage: imageUrl, // base64 data URL
            created_at: new Date().toISOString()
        }
        
        messages.value.push(aiMessage)
        
        // Автопрокрутка
        nextTick(() => {
            scrollToBottom()
        })
        
        // Обновляем список диалогов если нужно
        if (!dialogs.value.find(d => d.id === currentDialogId.value)) {
            await loadDialogs()
        }
        
        // Перезагружаем сообщения из БД, чтобы синхронизировать с сервером
        await loadMessages()
        
    } catch (error) {
        console.error('Error generating image:', error)
        
        let errorMessage = 'Ошибка при генерации изображения'
        if (error.message) {
            errorMessage = error.message
        } else if (error.data?.statusMessage) {
            errorMessage = error.data.statusMessage
        }
        
        showMessage(errorMessage, false)
        
        // Удаляем сообщение пользователя из UI при ошибке
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'user') {
            messages.value.pop()
        }
    } finally {
        isGeneratingImage.value = false
    }
}

/* получение имени файла для изображения */
const getImageFilename = (content) => {
    if (!content) return 'generated-image'
    // Извлекаем промпт из "Изображение сгенерировано: {prompt}"
    const match = content.match(/Изображение сгенерировано:\s*(.+)/)
    if (match && match[1]) {
        // Очищаем имя файла от недопустимых символов
        const cleanName = match[1]
            .replace(/[^a-zA-Zа-яА-Я0-9\s-]/g, '')
            .substring(0, 50)
            .trim()
        return cleanName || 'generated-image'
    }
    return 'generated-image'
}

/* скачивание сгенерированного изображения */
const downloadGeneratedImage = async (imageUrl, filename = 'generated-image') => {
    try {
        let blob, fileExtension
        
        // Если это base64 data URL, конвертируем его в blob
        if (imageUrl.startsWith('data:image')) {
            // Извлекаем MIME type и base64 данные
            const matches = imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
            if (matches) {
                const mimeType = matches[1]
                const base64Data = matches[2]
                fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType
                
                // Конвертируем base64 в blob
                const byteCharacters = atob(base64Data)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                blob = new Blob([byteArray], { type: `image/${mimeType}` })
            } else {
                throw new Error('Invalid data URL format')
            }
        } else {
            // Если это обычный URL, загружаем через fetch
            const response = await fetch(imageUrl)
            if (!response.ok) {
                throw new Error(`Ошибка загрузки изображения: ${response.statusText}`)
            }
            
            blob = await response.blob()
            
            // Определяем расширение файла из Content-Type или URL
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('jpeg')) {
                fileExtension = 'jpg'
            } else if (contentType.includes('png')) {
                fileExtension = 'png'
            } else if (contentType.includes('webp')) {
                fileExtension = 'webp'
            } else if (contentType.includes('gif')) {
                fileExtension = 'gif'
            } else {
                // Пытаемся извлечь из URL
                const urlMatch = imageUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
                fileExtension = urlMatch ? urlMatch[1] : 'png'
            }
        }
        
        // Создаем ссылку для скачивания
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.${fileExtension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        showMessage('Изображение скачано', true)
    } catch (error) {
        console.error('Error downloading generated image:', error)
        showMessage('Ошибка при скачивании изображения', false)
    }
}

/* обработка ошибки загрузки изображения */
const handleImageError = (event) => {
    console.error('Error loading generated image:', event)
    if (event.target) {
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EОшибка загрузки изображения%3C/text%3E%3C/svg%3E'
    }
}

/* автоматическое изменение размера textarea */
const autoResizeTextarea = () => {
    if (textareaInput.value) {
        textareaInput.value.style.height = 'auto'
        const newHeight = Math.min(textareaInput.value.scrollHeight, 200)
        textareaInput.value.style.height = `${newHeight}px`
    }
}
</script>