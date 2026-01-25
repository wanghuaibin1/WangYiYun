import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Readable } from 'node:stream'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      // 同源媒体代理：透传 Range，保证 <audio> 能正常分段请求 (206 / Accept-Ranges)
      name: 'media-range-proxy',
      configureServer(server) {
        server.middlewares.use('/__media', async (req, res) => {
          try {
            const url = new URL(req.url || '', 'http://localhost')
            const target = url.searchParams.get('url')
            if (!target) {
              res.statusCode = 400
              res.end('Missing url')
              return
            }

            // 透传 Range 请求头（关键）
            const headers: Record<string, string> = {}
            const range = req.headers.range
            if (typeof range === 'string' && range.length > 0) headers.Range = range

            // 也透传常见的 UA/Referer 以提高第三方直链成功率（可选但常见有效）
            if (typeof req.headers['user-agent'] === 'string') headers['User-Agent'] = req.headers['user-agent']
            if (typeof req.headers.referer === 'string') headers.Referer = req.headers.referer

            const upstream = await fetch(target, { headers, redirect: 'follow' })

            res.statusCode = upstream.status

            // 透传响应头（让浏览器看到 Accept-Ranges/Content-Range/Content-Length 等）
            upstream.headers.forEach((value, key) => {
              // 跳过可能与 Node 自动处理冲突的头
              if (key.toLowerCase() === 'transfer-encoding') return
              res.setHeader(key, value)
            })

            // body 可能为空（比如 HEAD / 416 等），兜底
            if (!upstream.body) {
              res.end()
              return
            }

            // 将 WebStream 转成 Node Stream 并 pipe
            Readable.fromWeb(upstream.body as any).pipe(res)
          } catch (e: any) {
            res.statusCode = 502
            res.end(`Media proxy failed: ${e?.message || 'unknown error'}`)
          }
        })
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        // target: 'http://8.156.86.126:3000/',
        target: 'https://ncm.zhenxin.me',
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
