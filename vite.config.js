import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/ai-rpg-engine/',
  plugins: [
    vue(),
  ],
})
