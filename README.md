# 🎵 Vue 音乐播放器

一个基于 Vue 3 + TypeScript 构建的现代化音乐播放器应用，提供流畅的音乐播放体验和丰富的交互功能。

## 📋 项目简介

这是一个功能完整的音乐播放器 Web 应用，采用现代化的前端技术栈开发。项目支持歌曲播放、歌词同步、播放列表管理、用户登录等核心功能，界面美观，交互流畅。

## ✨ 核心功能

### 🎶 音乐播放
- ✅ 播放/暂停控制
- ✅ 上一首/下一首切换
- ✅ 播放进度控制（拖拽进度条）
- ✅ 音量控制
- ✅ 播放模式切换（顺序播放、随机播放、单曲循环）
- ✅ 专辑封面旋转动画

### 📝 歌词功能
- ✅ 实时歌词同步显示
- ✅ 歌词自动滚动
- ✅ 歌词高亮显示当前播放行
- ✅ 手动滚动歌词时自动定位居中歌词
- ✅ 歌词时间轴精确匹配

### 📚 播放列表 & 歌单
- ✅ 播放列表管理
- ✅ 播放列表弹窗展示
- ✅ 歌曲切换和删除
- ✅ 播放模式适配
- ✅ 歌单详情页（支持播放全部 / 点击单曲播放）
- ✅ 首页推荐歌曲点击后**仅将该歌曲加入播放列表**，不重置整个列表

### 🔍 搜索与推荐
- ✅ 顶部全局搜索栏（历史记录、本地缓存）
- ✅ 热搜榜展示与一键播放热搜
- ✅ 搜索联想（关键词拆分 + 歌曲名联想）
- ✅ 榜单卡片（古风榜 / 摇滚榜 / 民谣榜等）快捷播放

### 🔐 用户功能
- ✅ 用户登录/登出
- ✅ 用户信息管理
- ✅ 歌曲收藏功能

### 🎨 界面特性
- ✅ 全屏播放页面
- ✅ 响应式布局设计
- ✅ 底部播放控制栏（固定定位）
- ✅ 流畅的页面过渡动画
- ✅ 深色主题风格

## 🛠️ 技术栈

### 核心框架
- **Vue 3.5.13** - 渐进式 JavaScript 框架
- **TypeScript 5.6.3** - 类型安全的 JavaScript 超集
- **Vite 6.0.1** - 下一代前端构建工具

### 状态管理
- **Pinia 2.2.6** - Vue 官方推荐的状态管理库

### 路由管理
- **Vue Router 4.4.5** - Vue.js 官方路由管理器

### UI 组件库
- **Element Plus 2.9.0** - 基于 Vue 3 的组件库
- **@element-plus/icons-vue 2.3.1** - Element Plus 图标库

### 样式方案
- **Tailwind CSS 3.4.16** - 实用优先的 CSS 框架
- **PostCSS 8.4.49** - CSS 转换工具
- **Autoprefixer 10.4.20** - CSS 自动添加浏览器前缀

### HTTP 客户端
- **Axios 1.7.9** - 基于 Promise 的 HTTP 库

### 动画库
- **@mojs/core 1.7.1** - 动画库（可选）

### 开发工具
- **ESLint 9.14.0** - 代码质量检查工具
- **Prettier 3.3.3** - 代码格式化工具
- **Vitest 2.1.5** - 单元测试框架
- **Vue DevTools** - Vue 开发调试工具

## 📁 项目结构

```
vue-project/
├── public/                    # 静态资源目录
│   └── favicon.ico            # 网站图标
│
├── src/                       # 源代码目录
│   ├── api/                   # API 接口定义
│   │   ├── modules/           # 模块化 API（登录 / 歌曲 / 搜索 / 用户 / 推荐 / 歌单等）
│   │   ├── index.ts           # API 导出
│   │   └── request.ts         # Axios 请求封装
│   │
│   ├── assets/                # 静态资源 & 样式
│   │   ├── base.css           # 基础样式
│   │   ├── main.css           # 主样式文件
│   │   └── logo.svg           # LOGO 资源
│   │
│   ├── components/            # 通用组件
│   │   ├── base/              # 基础组件
│   │   │   └── ErrorBoundary.vue        # 错误边界组件
│   │   ├── player-control/    # 播放器控制子组件
│   │   │   ├── Collect.vue              # 收藏按钮
│   │   │   ├── PlaybackControls.vue     # 播放/切歌控制
│   │   │   ├── ProgressBar.vue          # 播放进度条
│   │   │   └── VolumeControl.vue        # 音量控制
│   │   └── PlayerControlBar/            # 底部播放控制栏
│   │       └── index.vue
│   │
│   ├── hooks/                 # 组合式函数
│   │   ├── usePlayer.ts       # 播放器逻辑封装
│   │   ├── useTheme.ts        # 主题切换逻辑
│   │   └── useUser.ts         # 用户登录/信息逻辑封装
│   │
│   ├── layouts/               # 布局组件
│   │   └── PlayerLayout.vue   # 三层播放器布局（侧边栏 + 顶部搜索 + 底部播放栏）
│   │
│   ├── router/                # 路由配置
│   │   ├── modules/           # 路由模块
│   │   │   ├── guards.ts      # 路由守卫（登录校验等）
│   │   │   └── router.ts      # 路由定义
│   │   └── index.ts           # 路由入口
│   │
│   ├── stores/                # 状态管理（Pinia）
│   │   ├── modules/           # 状态模块
│   │   │   ├── song.ts        # 播放器/歌曲状态管理
│   │   │   └── user.ts        # 用户状态管理
│   │   └── index.ts           # Store 统一导出
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── api/               # API 类型
│   │   │   └── index.ts
│   │   ├── api.d.ts           # API 类型声明
│   │   ├── axios.d.ts         # Axios 类型声明
│   │   ├── player.d.ts        # 播放器/歌曲类型
│   │   └── search.d.ts        # 搜索相关类型
│   │
│   ├── utils/                 # 工具函数
│   │   ├── format.ts          # 时间/进度等格式化工具
│   │   ├── fun.ts             # 通用小工具函数
│   │   └── storage.ts         # 本地存储工具（localStorage 等）
│   │
│   ├── views/                 # 页面组件
│   │   ├── error/
│   │   │   └── 404.vue        # 404 页面
│   │   ├── home/
│   │   │   ├── component/
│   │   │   │   └── RankBoardCard.vue    # 榜单卡片组件
│   │   │   └── index.vue      # 首页（推荐/榜单/队列）
│   │   ├── login/
│   │   │   └── index.vue      # 登录页
│   │   ├── personal-Homepage/
│   │   │   └── index.vue      # 个人主页
│   │   ├── play-page/
│   │   │   └── index.vue      # 全屏歌词播放页
│   │   ├── playlist/
│   │   │   └── index.vue      # 歌单详情页（包含播放全部 / 单曲点击播放）
│   │   ├── playlistPage/
│   │   │   ├── component/
│   │   │   │   └── PlaylistItem.vue     # 播放列表项
│   │   │   └── index.vue      # 播放列表弹层
│   │   └── search/
│   │       ├── components/
│   │       │   └── SearchSongList.vue   # 搜索结果列表
│   │       └── index.vue      # 搜索结果页
│   │
│   ├── App.vue                # 根组件（包裹错误边界 + 路由视图）
│   └── main.ts                # 应用入口（创建应用、挂载路由/Pinia/UI 库）
│
├── .gitignore                 # Git 忽略配置
├── env.d.ts                   # 环境类型声明
├── eslint.config.js           # ESLint 配置
├── index.html                 # HTML 模板
├── package.json               # 项目依赖配置
├── package-lock.json          # 锁定依赖版本
├── postcss.config.js          # PostCSS 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 基础配置
├── tsconfig.app.json          # 应用 TS 配置
├── tsconfig.node.json         # Node 端 TS 配置
├── tsconfig.vitest.json       # 测试 TS 配置
├── vite.config.ts             # Vite 配置
└── vitest.config.ts           # Vitest 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器（支持热重载）：

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（端口可能因配置而异）。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

### 运行测试

```bash
npm run test:unit
```

## 🔧 开发配置

### API 代理配置

项目使用 Vite 的代理功能，开发环境下的 API 请求会被代理到后端服务器。

在 `vite.config.ts` 中配置：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### 路径别名

项目配置了 `@` 作为 `src` 目录的别名，可以在导入时使用：

```typescript
import { useSongStore } from '@/stores/modules/song'
```

## 📖 核心功能说明

### 播放器状态管理

播放器使用 Pinia 进行状态管理，主要状态包括：

- `playList`: 播放列表
- `currentSong`: 当前播放歌曲
- `playStatus`: 播放状态
- `currentTime`: 当前播放时间
- `duration`: 歌曲总时长
- `lyric`: 歌词数据
- `playMode`: 播放模式

### 播放模式

支持三种播放模式：

1. **顺序播放** - 按列表顺序播放
2. **随机播放** - 随机打乱播放顺序
3. **单曲循环** - 重复播放当前歌曲

### 歌词同步机制

- 根据音频播放时间自动匹配对应歌词
- 歌词自动滚动到当前播放行
- 支持手动滚动，自动定位居中歌词
- 初始化时智能选择显示位置

### 布局结构

项目采用三层布局结构（见 `PlayerLayout.vue`）：

1. **底层** - 正常页面内容（首页、搜索结果、歌单等，通过 `<router-view>` 渲染）
2. **中层** - 全屏播放详情页（歌词页，可覆盖在普通页面上，支持进入时锁定滚动）
3. **顶层** - 底部播放控制栏（固定定位，始终可见，承载播放/进度/音量等控制）

顶部还集成了一个**全局搜索栏**：

- 支持搜索历史记录管理（本地 `localStorage` 存储）
- 支持热搜榜展示和一键播放热搜榜单
- 输入时提供实时搜索联想（关键词拆分 + 歌曲名联想）
- 搜索结果通过路由跳转到 `search` 页面展示

## 🎯 开发规范

### 代码风格

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 进行类型约束

### 组件规范

- 使用 `<script setup>` 语法
- 组件命名采用 PascalCase
- Props 和 Emits 使用 TypeScript 类型定义
- 使用组合式函数（Composables）封装可复用逻辑

### 提交规范

建议使用约定式提交（Conventional Commits）：

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 📝 API 接口

### 歌曲相关

- `getSongDetail(ids)` - 获取歌曲详情
- `getSongUrl(id, br?)` - 获取歌曲播放地址
- `getLyric(id)` - 获取歌词

### 用户相关

- 登录接口
- 用户信息接口
- 收藏接口

## 🐛 已知问题

- 部分高级功能仍在迭代中（如更丰富的歌单管理、MV、评论等）
- 需要后端 API 支持才能完整运行

## 🔮 未来计划

- [ ] 完善搜索功能
- [ ] 添加歌单管理功能
- [ ] 支持 MV 播放
- [ ] 添加评论功能
- [ ] 优化移动端体验
- [ ] 添加更多主题选项
- [ ] 性能优化

## 📄 许可证

本项目为私有项目。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目维护者：王怀斌
- 联系方式：13458330763

---

**注意**：本项目需要后端 API 支持，请确保后端服务正常运行后再启动前端应用。
