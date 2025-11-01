<template>
    <div class="h-screen flex flex-col">
        <div class="flex items-center justify-between border-b border-white/20 pb-4">
            <button @click="isPanelShow = !isPanelShow" class="cursor-pointer flex max-md:hidden">
                <Icon class="text-3xl" name="material-symbols:menu-rounded"/>
            </button>
            <div class="flex items-center gap-4">
                <button @click="chatMode = 'text'" :class="chatMode === 'text' ? 'bg-[#201e18]' : ''" class="cursor-pointer flex items-center gap-2 rounded-xl p-2 border border-white/20 transition-all duration-500">
                    <Icon class="text-3xl" name="cuida:text-outline"/>
                    <span class="text-xl font-mono font-semibold">Текст</span>   
                </button>
                <button @click="chatMode = 'image'" :class="chatMode === 'image' ? 'bg-[#201e18]' : ''" class="cursor-pointer flex items-center gap-2 rounded-xl p-2 border border-white/20 transition-all duration-500">
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
                    <button @click="createNewDialog" class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                        <Icon class="text-xl text-[#14120B]" name="ic:round-plus"/>
                    </button>
                </div>
                <div class="flex flex-col gap-2 overflow-y-auto">
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
            <div class="grow flex flex-col gap-4 h-full">
                <div ref="messagesContainer" class="flex flex-col gap-6 grow overflow-y-auto mt-4 relative">
                    <div v-if="messages.length === 0 && chatMode === 'text' && dialogs.length > 0" class="flex items-center justify-center h-full">
                        <div class="flex flex-col gap-2 items-center text-center">
                            <p class="text-base font-mono font-medium text-gray-400">Попробуйте эти примеры для начала</p>
                            <div class="flex items-center flex-wrap gap-4 text-sm font-medium">
                                <button @click="sendExampleMessage('Что такое искусственный интеллект?')" class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-2xl" name="line-md:question"/>
                                    <span>Что такое ...</span>
                                </button>
                                <button @click="sendExampleMessage('Напиши документацию для моего проекта')" class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-2xl" name="akar-icons:pencil"/>
                                    <span>Напиши документацию</span>
                                </button>
                                <button @click="sendExampleMessage('Объясни кратко принцип работы нейронных сетей')" class="flex items-center gap-2 rounded-full px-4 py-1.5 bg-white text-[#14120B] transition-all duration-500 hover:opacity-70">
                                    <Icon class="text-2xl" name="material-symbols-light:blur-short-rounded"/>
                                    <span>Объясни кратко</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="messages.length === 0 && chatMode === 'image'" class="flex items-center justify-center h-full">
                        <div class="flex flex-col gap-2 items-center text-center">
                            <p class="text-base font-mono font-medium text-gray-400">Режим генерации изображений</p>
                            <p class="text-sm text-gray-500">В разработке...</p>
                        </div>
                    </div>
                    <div v-for="msg in messages" :key="msg.id" class="flex w-full group"
                        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        <div :class="msg.role === 'user' 
                            ? 'bg-white text-[#14120B]' 
                            : 'bg-[#201e18] border border-white/20'"
                            class="max-w-[80%] rounded-xl p-4 text-sm">
                            <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 w-full">
                                <div class="flex-1 formatted-message [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_pre]:my-2 [&_pre]:whitespace-pre [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:block [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:block [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:block [&_ul]:block [&_ol]:block [&_a]:underline [&_a]:text-blue-400 [&_a:hover]:text-blue-300" v-html="formatMessage(msg.content)"></div>
                                <button 
                                    @click="copyMessage(msg.content)"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-1 hover:bg-white/10 rounded"
                                    title="Копировать">
                                    <Icon class="text-lg" name="material-symbols:content-copy-outline"/>
                                </button>
                            </div>
                            <div v-else class="whitespace-pre-wrap">{{ msg.content }}</div>
                            <p class="text-xs mt-2 opacity-60">{{ formatTime(msg.created_at) }}</p>
                        </div>
                    </div>
                    <div v-if="isLoading" class="flex justify-start">
                        <div class="bg-[#201e18] border border-white/20 rounded-xl p-4 text-sm flex items-center gap-2">
                            <Icon class="text-xl animate-spin" name="line-md:loading-loop"/>
                            <span>Думаю...</span>
                        </div>
                    </div>
                </div>
                <div v-if="chatMode === 'text'" class="relative w-full flex-none group">
                    <textarea 
                        ref="textareaInput"
                        v-model="currentMessage"
                        @input="autoResizeTextarea"
                        @keydown.enter="handleSendMessage"
                        placeholder="Попроси ИИ решить твою проблему..." 
                        class="text-sm p-4 pr-20 rounded-xl border border-white/20 w-full bg-[#14120B] resize-none overflow-hidden"
                        style="min-height: 48px; max-height: 200px;"></textarea>
                    <div class="flex items-center gap-2 absolute bottom-4 right-4">
                        <button 
                            @click="handleFileAttach"
                            class="cursor-pointer flex items-center justify-center"
                            title="Прикрепить файл">
                            <Icon class="text-xl" name="ant-design:paper-clip-outlined"/>
                        </button>
                        <button @click="sendMessage" 
                            :disabled="isLoading || !currentMessage.trim()"
                            :class="isLoading || !currentMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''"
                            class="cursor-pointer rounded-full p-1 flex items-center justify-center bg-white">
                            <Icon class="text-xl text-[#14120B]" name="line-md:arrow-up"/>
                        </button>
                    </div>
                </div>
                <div v-if="chatMode === 'image'" class="relative w-full flex-none">
                    <div class="text-sm p-4 rounded-xl border border-white/20 w-full bg-[#14120B] text-center text-gray-400">
                        Режим генерации изображений в разработке
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

/* подключение хранилищ и бд */
const { id, authenticated } = useUserStore()
const { showMessage } = useMessagesStore()
const supabase = useSupabaseClient()

/* состояния */
const messages = ref([])
const currentMessage = ref('')
const isLoading = ref(false)
const currentDialogId = ref(1)
const dialogs = ref([])
const messagesContainer = ref(null)
const textareaInput = ref(null)
const chatMode = ref('text') // 'text' или 'image'

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
    await loadMessages()
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
        
        messages.value = data || []
        
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

/* отправка сообщения */
const sendMessage = async () => {
    if (!currentMessage.value.trim() || isLoading.value) return
    
    const userMessage = currentMessage.value.trim()
    currentMessage.value = ''
    
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
    
    // Добавляем сообщение пользователя в UI
    messages.value.push({
        id: Date.now(),
        role: 'user',
        content: userMessage,
        website_user_id: id,
        dialog_id: currentDialogId.value,
        created_at: new Date().toISOString()
    })
    
    isLoading.value = true
    
    try {
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
            message: userMessage,
            userId: String(id), // Преобразуем в строку на всякий случай
            dialogId: currentDialogId.value || 1,
            conversationHistory: historyMessages
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
        isLoading.value = false
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
        codeBlocks.push(`<pre class="bg-black/30 p-3 rounded my-2 overflow-x-auto border border-white/10"><code class="text-xs font-mono whitespace-pre">${escapedCode}</code></pre>`)
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
        inlineCodes.push(`<code class="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono border border-white/10">${escapedCode}</code>`)
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
    // TODO: Реализовать загрузку файлов
    showMessage('Функция загрузки файлов в разработке', false)
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