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

        <!-- 手机号验证码登录表单 -->
        <div v-if="loginType === 'account'" class="space-y-6">
          <el-form ref="formRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin">
            <el-form-item prop="phone">
              <el-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
                clearable
              >
                <template #prefix>
                  <el-icon><Iphone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="captcha">
              <div class="flex gap-2">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  maxlength="6"
                  clearable
                  class="flex-1"
                >
                  <template #prefix>
                    <el-icon><ChatLineRound /></el-icon>
                  </template>
                </el-input>
                <el-button
                  :disabled="!canSendCaptcha || sendingCaptcha"
                  :loading="sendingCaptcha"
                  @click="handleSendCaptcha"
                >
                  {{ captchaButtonText }}
                </el-button>
              </div>
            </el-form-item>

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
              <template v-if="isConfirming">
                <img
                  :src="scannerInfo!.avatarUrl"
                  alt="User Avatar"
                  class="w-48 h-48 rounded-full object-cover"
                />
                <p class="mt-2 text-gray-700 font-medium">{{ scannerInfo!.nickname }}</p>
              </template>
              <template v-else>
                <img :src="qrImage" alt="QR Code" class="w-48 h-48" />
              </template>

              <!-- 过期遮罩 -->
              <div
                v-if="qrCodeExpired"
                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg"
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
            <template v-if="isConfirming">
              <p class="text-blue-500">请在手机上确认登录</p>
              <p class="text-gray-500 text-sm">{{ scannerInfo!.nickname }}</p>
            </template>
            <template v-else>
              <p class="text-gray-500">使用网易云音乐 App 扫码登录</p>
              <p v-if="qrStatus === QRCodeStatus.Waiting" class="text-xs text-gray-400">
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
