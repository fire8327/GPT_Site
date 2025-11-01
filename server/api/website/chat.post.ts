import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    try {
        const body = await readBody(event)
        
        const { message, userId, dialogId, conversationHistory, files } = body
        
        // Отладочная информация
        console.log('Received body:', { 
            hasMessage: !!message, 
            hasUserId: !!userId,
            messageType: typeof message,
            userIdType: typeof userId,
            userIdValue: userId
        })
        
        // Проверяем что есть либо сообщение, либо файлы с содержимым для анализа
        const hasTextFiles = files && files.some((f: any) => f.isText && f.content && f.isSupported)
        const hasImageFiles = files && files.some((f: any) => f.isImage && f.isSupported)
        const hasUnsupportedFiles = files && files.some((f: any) => !f.isSupported)
        
        // Если только неподдерживаемые файлы, все равно позволяем отправить, чтобы ИИ сообщил об этом
        if ((!message || (typeof message === 'string' && message.trim() === '')) && !hasTextFiles && !hasImageFiles && !hasUnsupportedFiles) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing message or files'
            })
        }
        
        if (!userId || userId === null || userId === undefined || userId === '') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing or invalid userId field'
            })
        }
        
        // Убеждаемся что conversationHistory это массив
        const history = Array.isArray(conversationHistory) ? conversationHistory : []
        
        // Определяем есть ли поддерживаемые изображения в файлах
        const hasImages = files && files.some((f: any) => f.isImage && f.isSupported)
        
        // Выбираем модель:
        // - gpt-4o-mini поддерживает изображения и намного дешевле gpt-4o
        // - Если нужно более качество, можно использовать 'openai/gpt-4o' или 'anthropic/claude-3-sonnet'
        // - Еще более дешевые варианты: 'anthropic/claude-3-haiku' (быстрее, дешевле, но меньше качество)
        // - Бесплатный вариант: 'qwen/qwen-2-vl-2b-instruct' (но может быть менее точным)
        const model = 'openai/gpt-4o-mini' // Используем одну модель для текста и изображений
        
        // Формируем содержимое сообщения с учетом файлов
        let userMessageContent = message || ''
        
        // Если есть файлы, формируем расширенное сообщение
        if (files && files.length > 0) {
            const textFiles = files.filter((f: any) => f.isText && f.content && f.isSupported)
            const imageFiles = files.filter((f: any) => f.isImage && f.isSupported)
            const unsupportedFiles = files.filter((f: any) => !f.isSupported)
            
            // Добавляем содержимое текстовых файлов (включая SVG)
            if (textFiles.length > 0) {
                userMessageContent += '\n\n=== Прикрепленные файлы ===\n'
                textFiles.forEach((file: any) => {
                    // Определяем тип файла для контекста
                    const isSvg = file.name.match(/\.svg$/i) || file.type === 'image/svg+xml'
                    const fileTypeLabel = isSvg ? ' (SVG - векторная графика, XML код)' : ''
                    
                    userMessageContent += `\n--- ${file.name}${fileTypeLabel} ---\n${file.content}\n`
                })
            }
            
            // Добавляем информацию о неподдерживаемых файлах
            if (unsupportedFiles.length > 0) {
                userMessageContent += '\n\n=== Внимание: неподдерживаемые файлы ===\n'
                unsupportedFiles.forEach((file: any) => {
                    const reason = file.unsupportedReason || 'Формат файла не поддерживается для анализа'
                    userMessageContent += `\n📎 ${file.name}: ${reason}\n`
                })
                userMessageContent += '\nПожалуйста, сообщите пользователю, что эти файлы не могут быть проанализированы. Рекомендуется конвертировать их в поддерживаемые форматы: текстовые файлы (TXT, MD) или изображения.'
            }
            
            // Если есть изображения, они будут добавлены отдельно как base64
        }
        
        // Формируем массив сообщений
        const messagesArray: any[] = [
            {
                role: 'system',
                content: `Отвечай на русском языке.
Ты - умный и полезный помощник. Отвечай на вопросы, помогай с учебой, работой, творчеством и любыми другими задачами. Будь дружелюбным и профессиональным. Если хочешь, то используй эмодзи.

ВАЖНО:
- SVG файлы передаются тебе как текст (XML код) - ты можешь анализировать их содержимое, описывать структуру, элементы, стили и т.д.
- Ты можешь анализировать содержимое текстовых файлов и код, который тебе передается.
- Ты можешь анализировать изображения (PNG, JPG, GIF, WEBP), которые передаются как изображения.
- Если пользователь прикрепил неподдерживаемые форматы файлов (PDF, Word, Excel и т.д.), сообщи ему об этом дружелюбно и предложи альтернативы: конвертировать файл в текстовый формат (TXT, MD) или экспортировать как изображение.`
            },
            ...history
        ]
        
        // Формируем пользовательское сообщение
        if (files && files.some((f: any) => f.isImage && f.isSupported)) {
            // Если есть изображения, используем формат с content array
            const contentArray: any[] = []
            
            // Добавляем текстовую часть
            if (userMessageContent.trim()) {
                contentArray.push({
                    type: 'text',
                    text: userMessageContent
                })
            }
            
            // Добавляем только поддерживаемые изображения
            files.filter((f: any) => f.isImage && f.isSupported).forEach((file: any) => {
                try {
                    // Проверяем что data является валидным data URL
                    let imageUrl = file.data
                    
                    // Если это не data URL, преобразуем
                    if (!imageUrl.startsWith('data:')) {
                        const mimeType = file.type || 'image/png'
                        imageUrl = `data:${mimeType};base64,${imageUrl}`
                    }
                    
                    // Ограничиваем размер base64 строки (если слишком большое, обрезаем или пропускаем)
                    if (imageUrl.length > 10000000) { // ~10MB в base64
                        console.warn(`Image ${file.name} is too large for API, skipping`)
                        return
                    }
                    
                    contentArray.push({
                        type: 'image_url',
                        image_url: {
                            url: imageUrl
                        }
                    })
                } catch (error) {
                    console.error(`Error processing image ${file.name}:`, error)
                }
            })
            
            messagesArray.push({
                role: 'user',
                content: contentArray
            })
        } else {
            // Обычное текстовое сообщение
            messagesArray.push({
                role: 'user',
                content: userMessageContent || 'Прикреплены файлы'
            })
        }
        
        // Инициализация OpenRouter API
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openRouterApiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messagesArray,
                max_tokens: 12000
            })
        })
        
        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text()
            let errorMessage = `OpenRouter API error (${openRouterResponse.status})`
            
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error?.message || errorJson.message || errorText
                
                // Специальная обработка ошибок с изображениями
                if (errorMessage.includes('image') || errorMessage.includes('metadata') || errorMessage.includes('format')) {
                    errorMessage = `Ошибка обработки изображения: ${errorMessage}. Убедитесь, что файл является валидным изображением (PNG, JPG, GIF, WEBP) и не поврежден. SVG файлы обрабатываются как текстовые.`
                }
            } catch (e) {
                errorMessage = errorText || errorMessage
            }
            
            throw createError({
                statusCode: openRouterResponse.status,
                statusMessage: errorMessage
            })
        }
        
        const openRouterData = await openRouterResponse.json()
        const aiResponse = openRouterData.choices[0]?.message?.content || 'Не удалось получить ответ от AI.'
        
        // Сохранение сообщений в Supabase
        const supabaseUrl = config.public.supabase?.url || process.env.SUPABASE_URL
        const supabaseKey = config.public.supabase?.key || process.env.SUPABASE_KEY
        
        if (!supabaseUrl || !supabaseKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Supabase configuration missing'
            })
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Загружаем файлы в Supabase Storage если они есть
        let filesData = null
        if (files && Array.isArray(files) && files.length > 0) {
            // Создаем клиент с service role для загрузки файлов
            const supabaseStorage = createClient(supabaseUrl, supabaseKey)
            
            const uploadedFiles = await Promise.all(
                files.map(async (file: any) => {
                    try {
                        // Конвертируем base64 в Buffer (для Node.js)
                        const base64Data = file.data.split(',')[1] || file.data
                        const buffer = Buffer.from(base64Data, 'base64')
                        // В Node.js используем Buffer напрямую, Supabase принимает Buffer
                        
                        // Генерируем уникальное имя файла
                        const fileExtension = file.name.split('.').pop() || 'bin'
                        const uniqueFileName = `${userId}/${dialogId || 1}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
                        
                        // Загружаем файл в Storage (используем Buffer напрямую)
                        const { data: uploadData, error: uploadError } = await supabaseStorage.storage
                            .from('chat-files')
                            .upload(uniqueFileName, buffer, {
                                contentType: file.type || 'application/octet-stream',
                                upsert: false
                            })
                        
                        if (uploadError) {
                            console.error('Error uploading file:', uploadError)
                            return null
                        }
                        
                        // Получаем публичную ссылку
                        const { data: urlData } = supabaseStorage.storage
                            .from('chat-files')
                            .getPublicUrl(uniqueFileName)
                        
                        return {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            url: urlData.publicUrl,
                            path: uniqueFileName
                        }
                    } catch (error) {
                        console.error('Error processing file:', error)
                        return null
                    }
                })
            )
            
            // Фильтруем null значения (неудачные загрузки)
            filesData = uploadedFiles.filter(f => f !== null)
        }
        
        // Сохраняем сообщение пользователя (с файлами если есть)
        const userMessageData: any = {
            website_user_id: userId,
            role: 'user',
            content: message,
            dialog_id: dialogId || 1
        }
        
        // Добавляем файлы как JSONB если они есть (теперь со ссылками на Storage)
        // Для jsonb передаем массив напрямую, Supabase автоматически сериализует
        if (filesData && filesData.length > 0) {
            userMessageData.files = filesData
        }
        
        const { error: userMessageError } = await supabase
            .from('website_conversations')
            .insert(userMessageData)
        
        if (userMessageError) {
            console.error('Error saving user message:', userMessageError)
        }
        
        // Сохраняем ответ AI
        const { error: aiMessageError } = await supabase
            .from('website_conversations')
            .insert({
                website_user_id: userId,
                role: 'assistant',
                content: aiResponse,
                dialog_id: dialogId || 1
            })
        
        if (aiMessageError) {
            console.error('Error saving AI message:', aiMessageError)
        }
        
        return {
            response: aiResponse
        }
    } catch (error: any) {
        // Если это уже созданная ошибка, просто пробрасываем её
        if (error.statusCode) {
            throw error
        }
        
        // Иначе создаем новую ошибку
        console.error('Unexpected error in chat endpoint:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error'
        })
    }
})

