import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    try {
        const body = await readBody(event)
        
        const { message, userId, dialogId, conversationHistory } = body
        
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
        
        // Сохраняем сообщение пользователя
        const { error: userMessageError } = await supabase
            .from('website_conversations')
            .insert({
                website_user_id: userId,
                role: 'user',
                content: message,
                dialog_id: dialogId || 1
            })
        
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

