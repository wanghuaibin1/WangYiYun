<template>
  <div class="volume-wrap">
    <el-popover
      placement="top"
      :width="64"
      trigger="hover"
      popper-class="volume-popper"
      :show-arrow="false"
      :hide-after="150"
    >
      <template #reference>
        <button
          class="volume-btn"
          type="button"
          :aria-label="isMuted ? '取消静音' : '静音'"
          @click="toggleMute"
        >
          <!-- 静音图标 -->
          <svg v-if="isMuted" viewBox="0 0 24 24" class="volume-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16.5 12c0-.77-.18-1.49-.49-2.14l1.46-1.46A8.96 8.96 0 0 1 18.5 12c0 2.1-.72 4.04-1.93 5.58l-1.46-1.46c.85-1.14 1.39-2.55 1.39-4.12ZM19 12c0-2.48-.9-4.75-2.39-6.49l1.42-1.42A10.95 10.95 0 0 1 21 12c0 2.99-1.2 5.7-3.14 7.71l-1.42-1.42A8.94 8.94 0 0 0 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.73 4.73 1.27-1.27L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"
            />
          </svg>

          <!-- 普通音量图标 -->
          <svg v-else viewBox="0 0 24 24" class="volume-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77Z"
            />
          </svg>
        </button>
      </template>

      <!-- 弹出面板 -->
      <div class="volume-panel">
        <el-slider
          class="volume-slider"
          v-model="SongStore.volume"
          vertical
          height="140px"
          :min="0"
          :max="100"
          :show-tooltip="false"
          :reverse="true"
          @change="onVolumeCommitted"
        />
        <div class="volume-text" :class="{ muted: isMuted }">{{ SongStore.volume }}%</div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'

const SongStore = useSongStore()
const lastNonZeroVolume = ref<number>(50)

const isMuted = computed(() => SongStore.volume === 0)

watch(
  () => SongStore.volume,
  (v) => {
    if (v > 0) lastNonZeroVolume.value = v
  },
  { immediate: true }
)

const toggleMute = () => {
  if (SongStore.volume === 0) {
    SongStore.volume = Math.min(100, Math.max(1, lastNonZeroVolume.value || 50))
  } else {
    SongStore.volume = 0
  }
}

const onVolumeCommitted = (v: number) => {
  if (v > 0) lastNonZeroVolume.value = v
}
</script>

<style scoped>
.volume-wrap {
  margin: 0 16px;
}

.volume-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: #9ca3af;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition:
    background 0.3s ease,
    transform 0.2s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.volume-btn:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #ffffff;
  transform: translateY(-1px);
}

.volume-btn:active {
  transform: translateY(0) scale(0.96);
}

.volume-icon {
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}

.volume-btn:hover .volume-icon {
  transform: scale(1.05);
}

.volume-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 14px 12px;
}

.volume-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(229, 231, 235, 0.95);
  line-height: 1;
  user-select: none;
  padding: 6px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.volume-text.muted {
  color: rgba(255, 180, 180, 1);
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1));
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    0 2px 6px rgba(239, 68, 68, 0.2),
    0 0 12px rgba(239, 68, 68, 0.1);
  animation: muted-pulse 2s ease-in-out infinite;
}

@keyframes muted-pulse {
  0%, 100% {
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.1),
      0 2px 6px rgba(239, 68, 68, 0.2),
      0 0 12px rgba(239, 68, 68, 0.1);
  }
  50% {
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.1),
      0 2px 8px rgba(239, 68, 68, 0.25),
      0 0 16px rgba(239, 68, 68, 0.15);
  }
}
</style>

<style>
/* 全局 popover 样式 */
.volume-popper {
  z-index: 10050 !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.92)) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 0 !important;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 2px 8px rgba(0, 0, 0, 0.3) inset;
}

.volume-popper .volume-slider.el-slider.is-vertical {
  width: 28px;
}

.volume-popper .volume-slider .el-slider__runway {
  width: 8px;
  border-radius: 999px;
  background: rgba(30, 30, 40, 0.8);
}

.volume-popper .volume-slider .el-slider__bar {
  width: 8px;
  border-radius: 999px;
  background: linear-gradient(to top, #1d4ed8 0%, #2563eb 30%, #3b82f6 60%, #60a5fa 100%);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.volume-popper .volume-slider .el-slider__button-wrapper {
  left: 50%;
  transform: translateX(-50%);
}

.volume-popper .volume-slider .el-slider__button {
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.95);
  background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.8);
}

.volume-popper .volume-slider .el-slider__button:hover {
  transform: scale(1.15);
}

.volume-popper .volume-slider.is-dragging .el-slider__button {
  transform: scale(1.2);
  box-shadow: 0 8px 20px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,1);
}
</style>
