import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // 禁用浏览器缓存，避免 ERR_CACHE_READ_FAILURE
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    force: false // 设置为 true 可以强制重新预构建，但会减慢启动速度
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
