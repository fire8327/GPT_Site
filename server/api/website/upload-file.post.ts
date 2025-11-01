import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    try {
        const body = await readBody(event)
        const { fileData, fileName, fileType, userId } = body
        
        if (!fileData || !fileName || !userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: fileData, fileName, userId'
            })
        }
        
        // Инициализация Supabase клиента
        const supabaseUrl = config.public.supabase?.url || process.env.SUPABASE_URL
        const supabaseKey = config.public.supabase?.key || process.env.SUPABASE_KEY
        
        if (!supabaseUrl || !supabaseKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Supabase configuration missing'
            })
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Конвертируем base64 в Buffer (для Node.js)
        const base64Data = fileData.split(',')[1] || fileData
        const buffer = Buffer.from(base64Data, 'base64')
        
        // Генерируем уникальное имя файла
        const fileExtension = fileName.split('.').pop()
        const uniqueFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
        
        // Загружаем файл в Storage (bucket: chat-files) - используем Buffer напрямую
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat-files')
            .upload(uniqueFileName, buffer, {
                contentType: fileType || 'application/octet-stream',
                upsert: false
            })
        
        if (uploadError) {
            console.error('Error uploading file:', uploadError)
            throw createError({
                statusCode: 500,
                statusMessage: `Error uploading file: ${uploadError.message}`
            })
        }
        
        // Получаем публичную ссылку на файл
        const { data: urlData } = supabase.storage
            .from('chat-files')
            .getPublicUrl(uniqueFileName)
        
        return {
            success: true,
            fileUrl: urlData.publicUrl,
            filePath: uniqueFileName,
            fileName: fileName
        }
    } catch (error: any) {
        console.error('Error in upload-file endpoint:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || error.message || 'Internal server error'
        })
    }
})

