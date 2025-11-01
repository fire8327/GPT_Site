import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    try {
        const body = await readBody(event)
        
        const { prompt, size, userId, dialogId } = body
        
        // Проверяем обязательные поля
        if (!prompt || (typeof prompt === 'string' && prompt.trim() === '')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing or empty prompt field'
            })
        }
        
        if (!userId || userId === null || userId === undefined || userId === '') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing or invalid userId field'
            })
        }
        
        // Используем OpenRouter API для генерации изображений
        // Преобразуем формат (aspect ratio) в размер
        const aspectRatio = size || '1:1'
        
        // Маппинг форматов в разрешения (средние значения)
        const sizeMap: Record<string, string> = {
            '1:1': '1024x1024',      // Квадрат
            '16:9': '1792x1024',    // Широкоэкранный
            '9:16': '1024x1792',    // Портрет (вертикальный)
            '4:3': '1344x1024',     // Классический
            '3:4': '1024x1344',     // Вертикальный классический
            '21:9': '1920x1024'     // Ультраширокий
        }
        
        const validSize = sizeMap[aspectRatio] || '1024x1024'
        
        // Используем chat/completions согласно документации OpenRouter
        // Формат запроса соответствует примеру из документации
        
        console.log('Generating image with:', { model: 'openai/gpt-5-image-mini', prompt, size: validSize, aspectRatio })
        
        // Формируем промпт с информацией о размере и формате
        const enhancedPrompt = `${prompt}\n\nРазрешение: ${validSize}, Соотношение сторон: ${aspectRatio}`
        
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openRouterApiKey}`,
                'HTTP-Referer': 'https://your-site.com',
                'X-Title': 'GPT Site Image Generation'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Сгенерируй изображение: ${enhancedPrompt}`
                            }
                        ]
                    }
                ]
            })
        })
        
        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text()
            console.error('OpenRouter API error:', {
                status: openRouterResponse.status,
                statusText: openRouterResponse.statusText,
                error: errorText
            })
            
            let errorMessage = `OpenRouter API error (${openRouterResponse.status})`
            
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error?.message || errorJson.error?.code || errorJson.message || errorText
                
                // Специальная обработка ошибок
                if (errorMessage.includes('provider returned error') || errorMessage.includes('model not found')) {
                    errorMessage = `Модель openai/gpt-5-image-mini недоступна или не поддерживает генерацию изображений. Проверьте документацию OpenRouter для правильного названия модели или используйте другую модель для генерации изображений (например, dall-e-3 через OpenAI API).`
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
        console.log('OpenRouter response (RAW):', JSON.stringify(openRouterData, null, 2))
        
        // Извлекаем изображение из ответа
        // Структура: choices[0].message.images[0].image_url.url
        let imageUrl = null
        
        try {
            const choice = openRouterData.choices?.[0]
            const message = choice?.message
            const images = message?.images
            
            if (images && images.length > 0 && images[0]?.image_url?.url) {
                imageUrl = images[0].image_url.url
                console.log('Extracted image URL (base64 data URL)')
            } else {
                console.warn('No image found in response structure')
            }
        } catch (error) {
            console.error('Error extracting image from response:', error)
        }
        
        if (!imageUrl) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Изображение не было сгенерировано или не удалось его извлечь из ответа'
            })
        }
        
        // Получаем конфигурацию Supabase
        const supabaseUrl = config.public.supabase?.url || process.env.SUPABASE_URL
        const supabaseKey = config.public.supabase?.key || process.env.SUPABASE_KEY
        
        if (!supabaseUrl || !supabaseKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Supabase configuration is missing'
            })
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        const supabaseStorage = createClient(supabaseUrl, supabaseKey)
        
        // Конвертируем base64 data URL в Buffer и загружаем в Storage
        let storageImageUrl = null
        
        try {
            // Проверяем, что это base64 data URL
            if (!imageUrl.startsWith('data:image/')) {
                throw new Error('Invalid image format: expected base64 data URL')
            }
            
            // Извлекаем MIME type и base64 данные
            const matches = imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
            if (!matches || matches.length < 3) {
                throw new Error('Invalid data URL format')
            }
            
            const mimeType = matches[1] // например, 'png'
            const base64Data = matches[2]
            
            // Конвертируем base64 в Buffer
            const buffer = Buffer.from(base64Data, 'base64')
            
            // Генерируем уникальное имя файла
            const fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType
            const uniqueFileName = `generated-images/${userId}/${dialogId || 1}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
            
            // Загружаем файл в Storage
            const { data: uploadData, error: uploadError } = await supabaseStorage.storage
                .from('chat-files')
                .upload(uniqueFileName, buffer, {
                    contentType: `image/${mimeType}`,
                    upsert: false
                })
            
            if (uploadError) {
                console.error('Error uploading image to Storage:', uploadError)
                throw new Error(`Ошибка при загрузке изображения в хранилище: ${uploadError.message}`)
            }
            
            // Получаем публичную ссылку
            const { data: urlData } = supabaseStorage.storage
                .from('chat-files')
                .getPublicUrl(uniqueFileName)
            
            storageImageUrl = urlData.publicUrl
            console.log('Image uploaded to Storage:', storageImageUrl)
            
        } catch (storageError: any) {
            console.error('Error processing image for Storage:', storageError)
            throw createError({
                statusCode: 500,
                statusMessage: storageError.message || 'Ошибка при обработке изображения для хранилища'
            })
        }
        
        // Сохраняем сообщение пользователя
        const userMessageContent = `Сгенерировать изображение: ${prompt}`
        
        const { error: userMsgError } = await supabase
            .from('website_conversations')
            .insert({
                website_user_id: userId,
                role: 'user',
                content: userMessageContent,
                dialog_id: dialogId || 1,
                created_at: new Date().toISOString()
            })
        
        if (userMsgError) {
            console.error('Error saving user message:', userMsgError)
            // Не прерываем выполнение, продолжаем сохранять ответ AI
        }
        
        // Сохраняем ответ AI с URL изображения (не base64!)
        const { error: aiMsgError } = await supabase
            .from('website_conversations')
            .insert({
                website_user_id: userId,
                role: 'assistant',
                content: `Изображение сгенерировано: ${prompt}`,
                dialog_id: dialogId || 1,
                generated_image: storageImageUrl, // Сохраняем URL из Storage
                created_at: new Date().toISOString()
            })
        
        if (aiMsgError) {
            console.error('Error saving AI message:', aiMsgError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Ошибка при сохранении сообщения в базу данных'
            })
        }
        
        // Возвращаем URL изображения из Storage
        return {
            imageUrl: storageImageUrl,
            prompt: prompt
        }
    } catch (error: any) {
        // Если это уже созданная ошибка, просто пробрасываем её
        if (error.statusCode) {
            throw error
        }
        
        // Иначе создаем новую ошибку
        console.error('Unexpected error in generate-image endpoint:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error'
        })
    }
})

