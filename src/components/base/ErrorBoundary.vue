<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <el-icon class="text-danger mb-4" :size="48"><Warning /></el-icon>
      <h2 class="text-xl font-bold mb-2">{{ error.message || '发生错误' }}</h2>
      <p class="text-gray-500 mb-4">{{ error.details || '请稍后重试' }}</p>
      <el-button type="primary" @click="handleRetry">
        重试
      </el-button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const error = ref<{ message: string; details?: string } | null>(null)

const handleError = (e: Error) => {
  error.value = {
    message: e.message,
    details: e.stack
  }
}

const handleRetry = () => {
  error.value = null
  window.location.reload()
}

defineExpose({
  handleError
})
</script>

<style scoped>
.error-boundary {
  @apply flex items-center justify-center min-h-screen bg-gray-50;
}

.error-content {
  @apply text-center p-8 bg-white rounded-lg shadow-lg;
}
</style>
