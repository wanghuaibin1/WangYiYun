项目目录结构
project-root/
├── public/                      # 公共资源目录，不会被打包
│   ├── favicon.ico              # 网站图标
│   └── robots.txt               # SEO 爬虫配置
│
├── src/                         # 源代码目录
│   ├── assets/                  # 静态资源（图片、字体、样式等）
│   │   ├── images/              # 图片资源
│   │   ├── fonts/               # 字体文件
│   │   └── styles/              # 全局样式或变量
│   │       ├── global.scss      # 全局样式
│   │       ├── mixins.scss      # SCSS 混入
│   │       └── variables.scss   # SCSS 变量
│   │
│   ├── components/              # 通用组件
│   │   ├── UI/                  # 通用 UI 组件（如按钮、输入框）
│   │   ├── Layout/              # 布局组件（如导航栏、页脚）
│   │   └── Widgets/             # 特定功能的小组件
│   │
│   ├── views/                   # 页面级组件
│   │   ├── Home.vue             # 首页
│   │   ├── About.vue            # 关于页
│   │   └── Profile/             # 模块化页面
│   │       ├── Profile.vue      # 个人信息
│   │       └── Settings.vue     # 设置页面
│   │
│   ├── router/                  # 路由配置
│   │   ├── index.js             # 主路由配置
│   │   └── modules/             # 分模块路由
│   │       ├── auth.js          # 认证模块路由
│   │       └── product.js       # 产品模块路由
│   │
│   ├── store/                   # 状态管理
│   │   ├── index.js             # Vuex 主文件
│   │   ├── modules/             # 状态模块
│   │   │   ├── user.js          # 用户模块
│   │   │   └── product.js       # 产品模块
│   │   └── pinia/               # 使用 Pinia 的状态管理
│   │       ├── useUserStore.js  # 用户数据
│   │       └── useCartStore.js  # 购物车数据
│   │
│   ├── composables/             # 可复用的逻辑
│   │   ├── useAuth.js           # 认证逻辑
│   │   ├── useFetch.js          # 数据请求逻辑
│   │   └── useToggle.js         # 状态切换逻辑
│   │
│   ├── utils/                   # 工具函数
│   │   ├── date.js              # 日期处理
│   │   ├── debounce.js          # 防抖函数
│   │   └── storage.js           # 本地存储封装
│   │
│   ├── plugins/                 # 插件
│   │   ├── axios.js             # Axios 封装
│   │   ├── vuetify.js           # Vuetify 配置
│   │   └── dayjs.js             # Day.js 配置
│   │
│   ├── directives/              # 自定义指令
│   │   ├── focus.js             # 自动聚焦指令
│   │   └── permission.js        # 权限控制指令
│   │
│   ├── i18n/                    # 国际化文件
│   │   ├── en.json              # 英文语言包
│   │   ├── zh.json              # 中文语言包
│   │   └── index.js             # 国际化配置
│   │
│   ├── App.vue                  # 根组件
│   ├── main.js                  # 应用入口文件
│   └── env.d.ts                 # TypeScript 环境类型声明
│
├── tests/                       # 测试目录
│   ├── unit/                    # 单元测试
│   │   ├── example.test.js
│   │   └── utils.test.js
│   └── e2e/                     # 端到端测试
│       ├── home.spec.js
│       └── login.spec.js
│
├── .env                         # 环境变量配置（开发环境）
├── .env.production              # 环境变量配置（生产环境）
├── .eslintrc.js                 # ESLint 配置文件
├── .prettierrc.js               # Prettier 配置文件
├── package.json                 # 项目依赖配置
├── vite.config.js               # Vite 配置文件（如使用 Vite）
└── vue.config.js                # Vue CLI 配置文件（如使用 Vue CLI）
