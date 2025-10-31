import { defineFormKitConfig } from '@formkit/vue'
import { ru } from '@formkit/i18n'
import { createAutoAnimatePlugin } from '@formkit/addons'

export default defineFormKitConfig({
  // rules: {},
  locales: { ru },
  locale: 'ru',
  plugins: [
    createAutoAnimatePlugin()
  ]
  // etc. 
})