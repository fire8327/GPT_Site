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
        
        // Проверяем что message не пустой и userId существует
        if (!message || (typeof message === 'string' && message.trim() === '')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing or empty message field'
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
        
        // Инициализация OpenRouter API
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openRouterApiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Отвечай на русском языке.
Ты - умный и полезный помощник. Отвечай на вопросы, помогай с учебой, работой, творчеством и любыми другими задачами. Будь дружелюбным и профессиональным. Если хочешь, то используй эмодзи`
                    },
                    ...history,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 12000
            })
        })
        
        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text()
            throw createError({
                statusCode: openRouterResponse.status,
                statusMessage: `OpenRouter API error: ${errorText}`
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

