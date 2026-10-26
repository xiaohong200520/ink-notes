import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 使用相对路径，方便部署到 GitHub Pages 的任意子路径
export default defineConfig({
  base: './',
  plugins: [react()],
})
