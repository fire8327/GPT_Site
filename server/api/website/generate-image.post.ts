import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    try {
        const body = await readBody(event)
        
        const { prompt, size, userId, dialogId, inputImage } = body
        
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
        
        const hasInputImage = !!inputImage && typeof inputImage === 'string' && inputImage.startsWith('data:image/')
        console.log('Generating image with:', { 
            model: 'google/gemini-2.5-flash-image', 
            prompt, 
            size: validSize, 
            aspectRatio,
            hasInputImage: hasInputImage
        })
        
        // Формируем промпт с информацией о размере и формате
        const enhancedPrompt = hasInputImage 
            ? `${prompt}\n\nРазрешение: ${validSize}, Соотношение сторон: ${aspectRatio}`
            : `${prompt}\n\nРазрешение: ${validSize}, Соотношение сторон: ${aspectRatio}`
        
        // Формируем контент сообщения
        let messageContent: any[] = []
        
        if (hasInputImage) {
            // Для модификации изображений: сначала изображение, потом текст
            // Проверяем размер base64 строки (не должна быть слишком большой)
            const base64Length = inputImage.length
            if (base64Length > 20000000) { // ~20MB в base64
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Изображение слишком большое. Максимальный размер: ~15MB'
                })
            }
            
            messageContent = [
                {
                    type: 'image_url',
                    image_url: {
                        url: inputImage
                    }
                },
                {
                    type: 'text',
                    text: `Измени это изображение согласно описанию: ${prompt}. Сохрани общий стиль и качество изображения.`
                }
            ]
        } else {
            // Для генерации нового изображения
            messageContent = [
                {
                    type: 'text',
                    text: `Сгенерируй изображение: ${enhancedPrompt}`
                }
            ]
        }
        
        // Формируем тело запроса
        const requestBody: any = {
            model: 'google/gemini-2.5-flash-image',
            messages: [
                {
                    role: 'user',
                    content: messageContent
                }
            ]
        }
        
        // Для модификации изображений может потребоваться дополнительный параметр
        if (hasInputImage) {
            // Некоторые модели требуют явного указания, что это модификация
            requestBody.temperature = 0.7
        }
        
        console.log('Sending request to OpenRouter:', {
            model: requestBody.model,
            hasInputImage: hasInputImage,
            contentTypes: messageContent.map((c: any) => c.type),
            contentLength: JSON.stringify(messageContent).length
        })
        
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openRouterApiKey}`,
                'HTTP-Referer': 'https://your-site.com',
                'X-Title': 'GPT Site Image Generation'
            },
            body: JSON.stringify(requestBody)
        })
        
        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text()
            console.error('OpenRouter API error:', {
                status: openRouterResponse.status,
                statusText: openRouterResponse.statusText,
                error: errorText,
                hasInputImage: hasInputImage,
                requestBody: JSON.stringify(requestBody, null, 2)
            })
            
            let errorMessage = `OpenRouter API error (${openRouterResponse.status})`
            
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error?.message || errorJson.error?.code || errorJson.message || errorText
                
                // Специальная обработка ошибок
                if (errorMessage.includes('provider returned error') || errorMessage.includes('model not found')) {
                    if (hasInputImage) {
                        errorMessage = `Модель не поддерживает модификацию изображений или формат запроса неверный. Попробуйте использовать другую модель или сгенерировать новое изображение.`
                    } else {
                        errorMessage = `Модель недоступна или не поддерживает генерацию изображений. Проверьте документацию OpenRouter для правильного названия модели.`
                    }
                }
                
                // Обработка ошибок связанных с размером изображения
                if (errorMessage.includes('size') || errorMessage.includes('too large') || errorMessage.includes('limit')) {
                    errorMessage = `Изображение слишком большое или превышает лимиты API. Попробуйте использовать изображение меньшего размера.`
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
        // Структура может быть разной в зависимости от модели и типа запроса
        let imageUrl = null
        
        try {
            const choice = openRouterData.choices?.[0]
            const message = choice?.message
            
            // Вариант 1: Структура с images массивом (для генерации изображений)
            const images = message?.images
            if (images && images.length > 0 && images[0]?.image_url?.url) {
                imageUrl = images[0].image_url.url
                console.log('Extracted image URL from images array (base64 data URL)')
            }
            // Вариант 2: Изображение в content (для модификации изображений)
            else if (message?.content) {
                // Проверяем, является ли content массивом
                if (Array.isArray(message.content)) {
                    for (const item of message.content) {
                        if (item.type === 'image_url' && item.image_url?.url) {
                            imageUrl = item.image_url.url
                            console.log('Extracted image URL from content array')
                            break
                        }
                    }
                }
                // Если content - строка, пытаемся найти base64 data URL
                else if (typeof message.content === 'string') {
                    const base64Match = message.content.match(/data:image\/[^;]+;base64,[^\s"']+/)
                    if (base64Match) {
                        imageUrl = base64Match[0]
                        console.log('Extracted image URL from content string')
                    }
                }
            }
            // Вариант 3: Проверяем весь объект message на наличие изображений
            else {
                // Рекурсивно ищем image_url в объекте
                const findImageUrl = (obj: any): string | null => {
                    if (!obj || typeof obj !== 'object') return null
                    if (obj.image_url?.url) return obj.image_url.url
                    if (obj.url && typeof obj.url === 'string' && obj.url.startsWith('data:image/')) {
                        return obj.url
                    }
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            const result = findImageUrl(obj[key])
                            if (result) return result
                        }
                    }
                    return null
                }
                
                const foundUrl = findImageUrl(message)
                if (foundUrl) {
                    imageUrl = foundUrl
                    console.log('Extracted image URL by recursive search')
                }
            }
            
            if (!imageUrl) {
                console.warn('No image found in response structure. Full message:', JSON.stringify(message, null, 2))
                console.warn('Available keys in message:', message ? Object.keys(message) : 'message is null')
            }
        } catch (error) {
            console.error('Error extracting image from response:', error)
            console.error('Response structure:', JSON.stringify(openRouterData, null, 2))
        }
        
        if (!imageUrl) {
            // Пытаемся получить более детальную информацию об ошибке
            const errorDetails = {
                hasChoices: !!openRouterData.choices,
                choicesLength: openRouterData.choices?.length || 0,
                messageContent: openRouterData.choices?.[0]?.message?.content || 'N/A',
                messageKeys: openRouterData.choices?.[0]?.message ? Object.keys(openRouterData.choices[0].message) : []
            }
            console.error('Failed to extract image. Details:', errorDetails)
            
            throw createError({
                statusCode: 500,
                statusMessage: `Изображение не было сгенерировано или не удалось его извлечь из ответа. Ответ API: ${JSON.stringify(errorDetails)}`
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
        const userMessageContent = hasInputImage 
            ? `Изменить изображение: ${prompt}` 
            : `Сгенерировать изображение: ${prompt}`
        
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
                content: hasInputImage 
                    ? `Изображение изменено: ${prompt}` 
                    : `Изображение сгенерировано: ${prompt}`,
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

