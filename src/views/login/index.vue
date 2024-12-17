<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 顶部 Logo 和标题 -->
    <header class="py-6 text-center">
      <div class="flex items-center justify-center space-x-3">
        <el-icon class="text-3xl text-blue-500">
          <Headset />
        </el-icon>
        <h1 class="text-2xl font-bold">音乐播放器</h1>
      </div>
    </header>

    <!-- 登录框 -->
    <div class="flex-1 flex items-center justify-center px-4">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <!-- 登录方式切换 -->
        <div class="flex justify-between mb-8">
          <h2 class="text-xl font-semibold">登录</h2>
          <el-button
            link
            type="primary"
            @click="loginType = loginType === 'account' ? 'qrcode' : 'account'"
          >
            {{ loginType === 'account' ? '扫码登录' : '账号登录' }}
            <el-icon class="ml-1">
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>

        <!-- 账号登录表单 -->
        <div v-if="loginType === 'account'" class="space-y-6">
          <el-form ref="formRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <div class="flex items-center justify-between mb-6">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-button link type="primary" @click="handleForgotPassword"> 忘记密码？ </el-button>
            </div>

            <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form>
        </div>

        <!-- 扫码登录 -->
        <div v-else class="space-y-6 text-center">
          <div class="bg-gray-50 p-6 rounded-lg inline-block">
            <div class="relative">
              <!-- 二维码/头像显示 -->
              <template v-if="qrStatus === QRCodeStatus.Confirming && scannerInfo">
                <img
                  :src="scannerInfo.avatarUrl"
                  alt="User Avatar"
                  class="w-48 h-48 rounded-full object-cover"
                />
                <p class="mt-2 text-gray-700 font-medium">{{ scannerInfo.nickname }}</p>
              </template>
              <template v-else>
                <img :src="qrImage" alt="QR Code" class="w-48 h-48" />
              </template>

              <!-- 过期遮罩 -->
              <div
                v-if="qrCodeExpired"
                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"
              >
                <div class="text-white space-y-2">
                  <p>二维码已过期</p>
                  <el-button type="primary" @click="refreshQRCode">
                    <el-icon class="mr-1">
                      <Refresh />
                    </el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 状态提示 -->
          <div class="space-y-2">
            <template v-if="qrStatus === QRCodeStatus.Confirming && scannerInfo">
              <p class="text-blue-500">请在手机上确认登录</p>
              <p class="text-gray-500 text-sm">
                {{ scannerInfo.nickname }}
              </p>
            </template>
            <template v-else>
              <p class="text-gray-500">使用网易云音乐 App 扫码登录</p>
              <p class="text-xs text-gray-400" v-if="qrStatus === QRCodeStatus.Waiting">
                请使用 App 扫描二维码
              </p>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部帮助区域 -->
    <footer class="py-6 text-center text-gray-500">
      <div class="space-x-4">
        <el-button link @click="handleHelp">帮助中心</el-button>
        <el-button link @click="handleCustomerService">联系客服</el-button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { loginAPI,UserAPI } from '@/api'
import { QRCodeStatus } from '@/api/auth'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const loginType = ref<'account' | 'qrcode'>('account')
const qrCodeExpired = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false,
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
})

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let res
        if (loginForm.username.includes('@')) {
          // 邮箱登录
          res = await loginAPI.loginByEmail(loginForm.username, loginForm.password)
        } else {
          // 手机号登录
          res = await loginAPI.loginByPhone(loginForm.username, loginForm.password)
        }

        if (res.code === 200) {
          // 保存登录凭证
          if (res.cookie) {
            localStorage.setItem('Cookie', res.cookie)
          }
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 处理忘记密码
const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中...')
}

// 二维码登录相关状态
const qrKey = ref('')
const qrImage = ref('')
const qrUrl = ref('')
const qrStatus = ref<QRCodeStatus>(QRCodeStatus.Waiting)
const qrCheckTimer = ref<number>()

// 扫码用户信息
interface ScannerInfo {
  nickname: string
  avatarUrl: string
}

const scannerInfo = ref<ScannerInfo | null>(null)

// 初始化二维码
const initQRCode = async () => {
  try {
    // 获取二维码 key
    const { data: keyRes } = await loginAPI.getQRKey()
    if (keyRes.value.code === 200) {
      qrKey.value = keyRes.value.data.unikey
      // 生成二维码
      const { data: qrRes } = await loginAPI.createQRCode(qrKey.value)
      if (qrRes.value.code === 200) {
        console.log(qrRes.value)
        qrImage.value = qrRes.value.data.qrimg
        qrUrl.value = qrRes.value.data.qrurl
        qrStatus.value = QRCodeStatus.Waiting
        qrCodeExpired.value = false
        startQRCheck()
      }
    }
  } catch (error) {
    ElMessage.error('获取二维码失败')
  }
}

// 开始轮询检查二维码状态
const startQRCheck = () => {
  if (qrCheckTimer.value) {
    clearInterval(qrCheckTimer.value)
  }
  qrCheckTimer.value = window.setInterval(async () => {
    try {
      const { data:res } = await loginAPI.checkQRStatus(qrKey.value)
        qrStatus.value =  res.value.code
        switch (qrStatus.value) {
          case QRCodeStatus.Expired:
            ElMessage.warning('二维码已过期，请刷新重试')
            qrCodeExpired.value = true
            scannerInfo.value = null
            clearInterval(qrCheckTimer.value)
            break

          case QRCodeStatus.Waiting:
            scannerInfo.value = null
            break

          case QRCodeStatus.Confirming:
            if (res.value.nickname && res.value.avatarUrl) {
              scannerInfo.value = {
                nickname: res.value.nickname,
                avatarUrl: res.value.avatarUrl,
              }
            }
            break

          case QRCodeStatus.Success:
            ElMessage.success(res.value.message)
            clearInterval(qrCheckTimer.value)
            if (res.value.cookie) {
              console.log(res.value.cookie)
              document.cookie = res.value.cookie;
              const { data:Status } = await loginAPI.RefreshLoginStatus(res.value.cookie)
              const { data:UserInfo } = await UserAPI.getUserInfo(Status.value.data.account.id)
              // 保存登录凭证
              localStorage.setItem('UserInfo', JSON.stringify(UserInfo.value));
              localStorage.setItem('Cookie', res.value.cookie)
              router.push({ path: '/' });
            }
            break

          default:
            if (res.message) {
              ElMessage.error(res.message)
            }
        }
    } catch (error) {
      clearInterval(qrCheckTimer.value)
      ElMessage.error('检查二维码状态失败')
    }
  }, 2000)
}

// 刷新二维码时清除扫码信息
const refreshQRCode = () => {
  qrCodeExpired.value = false
  scannerInfo.value = null
  initQRCode()
}

// 切换登录方式时清除扫码信息
watch(loginType, (newType) => {
  if (newType === 'qrcode') {
    initQRCode()
  } else {
    scannerInfo.value = null
    if (qrCheckTimer.value) {
      clearInterval(qrCheckTimer.value)
    }
  }
})

// 帮助中心
const handleHelp = () => {
  window.open('/help', '_blank')
}

// 联系客服
const handleCustomerService = () => {
  ElMessage.success('正在接入客服...')
}
</script>

<style scoped>
.el-input {
  --el-input-height: 45px;
}

/* 添加头像过渡效果 */
.rounded-full {
  transition: all 0.3s ease-in-out;
}

/* 添加头像悬停效果 */
.rounded-full:hover {
  transform: scale(1.05);
}
</style>
