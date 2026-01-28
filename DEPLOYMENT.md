# 部署配置说明

## 环境变量配置

### 创建环境变量文件

在项目根目录创建以下文件：

#### `.env.development` (开发环境)
```bash
# 开发环境 API 地址
VITE_BASE_API=https://ncm.zhenxin.me
```

#### `.env.production` (生产环境)
```bash
# 生产环境 API 地址
# 请根据实际部署的后端地址修改
VITE_BASE_API=https://ncm.zhenxin.me
```

### 注意事项

1. **环境变量命名**：Vite 要求环境变量必须以 `VITE_` 开头才能在前端代码中访问
2. **修改后重新构建**：修改环境变量后需要重新运行 `npm run build` 才能生效
3. **不要提交敏感信息**：确保 `.env.production` 中的敏感信息不会被提交到 Git

## 跨域问题解决方案

### 问题描述

打包部署后，接口返回 200 状态码但没有数据，通常是 CORS（跨域资源共享）问题。

### 解决方案

#### 方案一：后端配置 CORS（推荐）

后端服务器需要设置正确的 CORS 响应头：

```javascript
// Express 示例
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-frontend-domain.com')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
```

#### 方案二：使用 Nginx 反向代理（推荐）

如果前端和后端部署在同一服务器，使用 Nginx 反向代理可以避免 CORS 问题：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass https://ncm.zhenxin.me;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS 头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization';
    }
}
```

然后修改 `.env.production`：
```bash
VITE_BASE_API=/api
```

#### 方案三：修改前端请求配置

如果后端无法配置 CORS，可以尝试：

1. **移除 credentials**：在 `src/api/request.ts` 中设置 `withCredentials: false`
2. **使用 JSONP**：仅适用于 GET 请求（不推荐）
3. **使用代理服务**：通过中间代理服务器转发请求

## 调试步骤

### 1. 检查网络请求

打开浏览器开发者工具（F12）→ Network 标签：
- 查看请求的 URL 是否正确
- 查看请求头（Request Headers）
- 查看响应头（Response Headers），特别是 CORS 相关头
- 查看响应体（Response）是否有数据

### 2. 检查控制台日志

代码中已添加详细的请求/响应日志：
- 开发环境会自动打印请求和响应信息
- 生产环境可以通过浏览器控制台查看错误信息

### 3. 常见错误

- **CORS 错误**：浏览器控制台会显示 `Access-Control-Allow-Origin` 相关错误
- **404 错误**：检查 API 地址是否正确
- **401/403 错误**：检查认证信息
- **响应为空**：检查响应拦截器是否正确处理数据

## 构建和部署

### 1. 构建生产版本

```bash
npm run build
```

### 2. 部署到服务器

将 `dist` 目录中的文件部署到 Web 服务器（Nginx、Apache 等）

### 3. 配置服务器

确保服务器支持：
- SPA 路由（所有路由都返回 `index.html`）
- 静态文件服务
- HTTPS（推荐）

## 验证部署

部署后检查：
1. ✅ 页面可以正常访问
2. ✅ API 请求可以正常发送
3. ✅ 响应数据可以正常接收
4. ✅ 没有 CORS 错误
5. ✅ 控制台没有错误信息

## 联系支持

如果遇到问题，请检查：
1. 浏览器控制台的错误信息
2. Network 标签中的请求详情
3. 服务器日志
4. 环境变量配置是否正确



