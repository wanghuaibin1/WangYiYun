<template>
  <div class="login-page min-h-screen flex flex-col relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 顶部 Logo 和标题 -->
    <header class="relative z-10 py-8 text-center">
      <div class="flex items-center justify-center space-x-3 animate-fade-in">
        <div class="relative">
          <el-icon class="text-4xl text-blue-400 drop-shadow-lg">
            <Headset />
          </el-icon>
          <div class="absolute inset-0 text-4xl text-blue-500 blur-xl opacity-50 animate-pulse"></div>
        </div>
        <h1 class="text-3xl font-bold text-white drop-shadow-lg">音乐播放器</h1>
      </div>
    </header>

    <!-- 登录框 -->
    <div class="flex-1 flex items-center justify-center px-4 relative z-10">
      <div class="login-card glass-panel w-full max-w-md animate-slide-up">
        <!-- 登录方式切换 -->
        <div class="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
          <h2 class="text-2xl font-bold text-white">登录</h2>
          <el-button
            link
            class="text-blue-400 hover:text-blue-300 transition-colors"
            @click="loginType = loginType === 'account' ? 'qrcode' : 'account'"
          >
            <span class="text-sm">{{ loginType === 'account' ? '扫码登录' : '账号登录' }}</span>
            <el-icon class="ml-1">
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>

        <!-- 手机号验证码登录表单 -->
        <div v-if="loginType === 'account'" class="space-y-6">
          <el-form ref="formRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin">
            <el-form-item prop="phone" class="login-form-item">
              <el-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
                clearable
                class="login-input"
              >
                <template #prefix>
                  <el-icon class="text-gray-400"><Iphone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="captcha" class="login-form-item">
              <div class="flex gap-3">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  maxlength="6"
                  clearable
                  class="flex-1 login-input"
                >
                  <template #prefix>
                    <el-icon class="text-gray-400"><ChatLineRound /></el-icon>
                  </template>
                </el-input>
                <el-button
                  :disabled="!canSendCaptcha || sendingCaptcha"
                  :loading="sendingCaptcha"
                  class="captcha-btn"
                  @click="handleSendCaptcha"
                >
                  {{ captchaButtonText }}
                </el-button>
              </div>
            </el-form-item>

            <el-button
              type="primary"
              class="w-full login-btn h-12 text-base font-medium"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
            <p class="text-red-500 text-center">目前手机号登录官方API限制，无法使用，请使用二维码登录！</p>
          </el-form>
        </div>

        <!-- 扫码登录 -->
        <div v-else class="space-y-6 text-center">
          <div class="qr-container inline-block p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div class="relative">
              <!-- 二维码/头像显示 -->
              <template v-if="isConfirming">
                <div class="avatar-wrapper">
                  <img
                    :src="scannerInfo!.avatarUrl"
                    alt="User Avatar"
                    class="w-48 h-48 rounded-full object-cover border-4 border-blue-400/50 shadow-lg"
                  />
                  <div class="absolute inset-0 rounded-full bg-blue-400/20 blur-xl animate-pulse"></div>
                </div>
                <p class="mt-4 text-white font-medium text-lg">{{ scannerInfo!.nickname }}</p>
              </template>
              <template v-else>
                <div class="qr-wrapper">
                  <img :src="qrImage" alt="QR Code" class="w-48 h-48 rounded-lg shadow-xl" />
                  <div class="absolute inset-0 rounded-lg bg-blue-500/10 blur-xl"></div>
                </div>
              </template>

              <!-- 过期遮罩 -->
              <div
                v-if="qrCodeExpired"
                class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl"
              >
                <div class="text-white space-y-4">
                  <p class="text-lg font-medium">二维码已过期</p>
                  <el-button type="primary" class="refresh-btn" @click="refreshQRCode">
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
            <template v-if="isConfirming">
              <p class="text-blue-400 font-medium flex items-center justify-center gap-2">
                <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                请在手机上确认登录
              </p>
              <p class="text-gray-300 text-sm">{{ scannerInfo!.nickname }}</p>
            </template>
            <template v-else>
              <p class="text-gray-300">使用网易云音乐 App 扫码登录</p>
              <p v-if="qrStatus === QRCodeStatus.Waiting" class="text-xs text-gray-400 mt-1">
                请使用 App 扫描二维码
              </p>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部帮助区域 -->
    <footer class="relative z-10 py-6 text-center">
      <div class="space-x-6">
        <el-button
          link
          class="text-gray-400 hover:text-white transition-colors"
          @click="handleHelp"
        >
          帮助中心
        </el-button>
        <el-button
          link
          class="text-gray-400 hover:text-white transition-colors"
          @click="handleCustomerService"
        >
          联系客服
        </el-button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { loginAPI } from '@/api'
import { useUserStore } from '@/stores/modules/user'
import { QRCodeStatus, type QRCheckResponse } from '@/types/api'

// ==================== 常量定义 ====================
const QR_CHECK_INTERVAL = 2000 // 二维码状态检查间隔（毫秒）
const SUCCESS_CODE = 200 // 成功状态码
const userStore = useUserStore()
// ==================== 类型定义 ====================
interface ScannerInfo {
  nickname: string
  avatarUrl: string
}

type LoginType = 'account' | 'qrcode'

// ==================== 响应式数据 ====================
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const loginType = ref<LoginType>('account')
const qrCodeExpired = ref(false)

// 登录表单
const loginForm = reactive({
  phone: '',
  captcha: '',
})

// 验证码相关状态
const sendingCaptcha = ref(false)
const countdown = ref(0)
const countdownTimer = ref<ReturnType<typeof setInterval> | null>(null)

// 二维码登录相关状态
const qrKey = ref('')
const qrImage = ref('')
const qrUrl = ref('')
const qrStatus = ref<QRCodeStatus>(QRCodeStatus.Waiting)
const qrCheckTimer = ref<ReturnType<typeof setInterval> | null>(null)
const scannerInfo = ref<ScannerInfo | null>(null)

// ==================== 表单验证规则 ====================
const rules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      pattern: /^\d{4,6}$/,
      message: '验证码为4-6位数字',
      trigger: 'blur',
    },
  ],
})

// ==================== 计算属性 ====================
const isConfirming = computed(
  () => qrStatus.value === QRCodeStatus.Confirming && scannerInfo.value !== null,
)

/**
 * 是否可以发送验证码
 */
const canSendCaptcha = computed(() => {
  return /^1[3-9]\d{9}$/.test(loginForm.phone) && countdown.value === 0
})

/**
 * 验证码按钮文本
 */
const captchaButtonText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后重试`
  }
  return '发送验证码'
})

// ==================== 工具函数 ====================
/**
 * 清理二维码检查定时器
 */
const clearQRCheckTimer = () => {
  if (qrCheckTimer.value) {
    clearInterval(qrCheckTimer.value)
    qrCheckTimer.value = null
  }
}

/**
 * 重置二维码状态
 */
const resetQRState = () => {
  qrCodeExpired.value = false
  scannerInfo.value = null
  qrStatus.value = QRCodeStatus.Waiting
}

/**
 * 保存登录凭证
 */
const saveLoginCredentials = (cookie: string, userInfo?: unknown) => {
  localStorage.setItem('Cookie', cookie)
  if (userInfo) {
    localStorage.setItem('UserInfo', JSON.stringify(userInfo))
  }
}

/**
 * 处理登录成功后的操作
 */
const handleLoginSuccess = async (cookie: string) => {

  try {
    document.cookie = cookie
    const { data: statusRes } = await loginAPI.RefreshLoginStatus(cookie)
    const accountId = statusRes.value.data?.account?.id
    if (accountId) {
      await userStore.loginSuccess(accountId,cookie)
    } else {
      saveLoginCredentials(cookie)
    }
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('保存登录信息失败:', error)
    ElMessage.error('登录成功，但保存信息失败')
  }
}

// ==================== 手机号验证码登录相关 ====================
/**
 * 清理倒计时定时器
 */
const clearCountdownTimer = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

/**
 * 开始倒计时
 */
const startCountdown = () => {
  clearCountdownTimer()
  countdown.value = 60
  countdownTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearCountdownTimer()
    }
  }, 1000)
}

/**
 * 发送验证码
 */
const handleSendCaptcha = async () => {
  if (!canSendCaptcha.value) return

  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  sendingCaptcha.value = true
  try {
    const { data: res } = await loginAPI.sendCaptcha(loginForm.phone)
    if (res.value.code === SUCCESS_CODE) {
      ElMessage.success('验证码已发送，请查收')
      startCountdown()
    } else {
      ElMessage.error(res.value.message || '发送验证码失败，请稍后重试')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  } finally {
    sendingCaptcha.value = false
  }
}

/**
 * 处理手机号验证码登录
 */
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const {data: res } = await loginAPI.loginByPhoneWithCaptcha(loginForm.phone, loginForm.captcha)

      if (res.value.code === SUCCESS_CODE && res.value.cookie) {
        await handleLoginSuccess(res.value.cookie)
      } else {
        ElMessage.error(res.value.message || '登录失败，检测到您的网络环境存在风险，请稍后再试')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

// ==================== 二维码登录相关 ====================
/**
 * 处理二维码状态变化
 */
const handleQRStatusChange = async (response: QRCheckResponse) => {
  qrStatus.value = response.code

  switch (response.code) {
    case QRCodeStatus.Expired:
      ElMessage.warning('二维码已过期，请刷新重试')
      qrCodeExpired.value = true
      scannerInfo.value = null
      clearQRCheckTimer()
      break

    case QRCodeStatus.Waiting:
      scannerInfo.value = null
      break

    case QRCodeStatus.Confirming:
      if (response.nickname && response.avatarUrl) {
        scannerInfo.value = {
          nickname: response.nickname,
          avatarUrl: response.avatarUrl,
        }
      }
      break

    case QRCodeStatus.Success:
      clearQRCheckTimer()
      if (response.cookie) {
        await handleLoginSuccess(response.cookie)
      } else {
        ElMessage.error('登录失败，未获取到登录凭证')
      }
      break

    default:
      if (response.message) {
        ElMessage.error(response.message)
      }
  }
}

/**
 * 开始轮询检查二维码状态
 */
const startQRCheck = () => {
  clearQRCheckTimer()

  qrCheckTimer.value = setInterval(async () => {
    if (!qrKey.value) {
      clearQRCheckTimer()
      return
    }

    try {
      const { data: res } = await loginAPI.checkQRStatus(qrKey.value)
      await handleQRStatusChange(res.value)
    } catch (error) {
      console.error('检查二维码状态失败:', error)
      ElMessage.error('检查二维码状态失败')
      clearQRCheckTimer()
    }
  }, QR_CHECK_INTERVAL)
}

/**
 * 初始化二维码
 */
const initQRCode = async () => {
  try {
    resetQRState()

    // 获取二维码 key
    const { data: keyRes } = await loginAPI.getQRKey()
    if (keyRes.value.code !== SUCCESS_CODE || !keyRes.value.data?.unikey) {
      ElMessage.error('获取二维码密钥失败')
      return
    }

    qrKey.value = keyRes.value.data.unikey

    // 生成二维码
    const { data: qrRes } = await loginAPI.createQRCode(qrKey.value)
    if (qrRes.value.code !== SUCCESS_CODE || !qrRes.value.data) {
      ElMessage.error('生成二维码失败')
      return
    }

    qrImage.value = qrRes.value.data.qrimg
    qrUrl.value = qrRes.value.data.qrurl
    qrStatus.value = QRCodeStatus.Waiting
    startQRCheck()
  } catch (error) {
    console.error('初始化二维码失败:', error)
    ElMessage.error('获取二维码失败，请稍后重试')
  }
}

/**
 * 刷新二维码
 */
const refreshQRCode = () => {
  resetQRState()
  initQRCode()
}

// ==================== 其他功能 ====================
/**
 * 帮助中心
 */
const handleHelp = () => {
  window.open('/help', '_blank')
}

/**
 * 联系客服
 */
const handleCustomerService = () => {
  ElMessage.info('正在接入客服...')
}

// ==================== 生命周期和监听器 ====================
// 切换登录方式时清除扫码信息
watch(loginType, (newType) => {
  if (newType === 'qrcode') {
    initQRCode()
  } else {
    resetQRState()
    clearQRCheckTimer()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  clearQRCheckTimer()
  clearCountdownTimer()
})
</script>

<style scoped>
/* 登录页面背景 */
.login-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

/* 玻璃态卡片效果 */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 输入框样式 */
.login-input {
  --el-input-height: 50px;
  --el-input-bg-color: rgba(255, 255, 255, 0.05);
  --el-input-border-color: rgba(255, 255, 255, 0.1);
  --el-input-hover-border-color: rgba(99, 102, 241, 0.5);
  --el-input-focus-border-color: rgba(99, 102, 241, 0.8);
  --el-input-text-color: #ffffff;
  --el-input-placeholder-color: rgba(255, 255, 255, 0.4);
}

.login-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(99, 102, 241, 0.5);
  background-color: rgba(255, 255, 255, 0.08);
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(99, 102, 241, 0.8);
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.login-input :deep(.el-input__inner) {
  color: #ffffff;
}

.login-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

/* 表单项样式 */
.login-form-item {
  margin-bottom: 1.5rem;
}

.login-form-item :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
}

.login-form-item :deep(.el-form-item__error) {
  color: #f87171;
}

/* 验证码按钮 */
.captcha-btn {
  height: 50px;
  padding: 0 1.5rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.captcha-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
  color: #c7d2fe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.captcha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 登录按钮 */
.login-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* 二维码容器 */
.qr-container {
  transition: all 0.3s ease;
}

.qr-container:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.qr-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-wrapper img {
  transition: all 0.3s ease;
}

.avatar-wrapper:hover img {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

/* 刷新按钮 */
.refresh-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .glass-panel {
    padding: 1.5rem;
    border-radius: 1rem;
  }

  .login-input {
    --el-input-height: 45px;
  }

  .captcha-btn {
    height: 45px;
    padding: 0 1rem;
    font-size: 0.875rem;
  }
}
</style>
