<template>
  <div class="volume-wrap">
    <el-popover
      placement="top"
      :width="56"
      trigger="hover"
      popper-class="volume-popper"
      :show-arrow="false"
      :hide-after="80"
    >
      <template #reference>
        <button
          class="volume-btn"
          type="button"
          :aria-label="isMuted ? '取消静音' : '静音'"
          @click="toggleMute"
        >
          <svg v-if="isMuted" viewBox="0 0 24 24" class="volume-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16.5 12c0-.77-.18-1.49-.49-2.14l1.46-1.46A8.96 8.96 0 0 1 18.5 12c0 2.1-.72 4.04-1.93 5.58l-1.46-1.46c.85-1.14 1.39-2.55 1.39-4.12ZM19 12c0-2.48-.9-4.75-2.39-6.49l1.42-1.42A10.95 10.95 0 0 1 21 12c0 2.99-1.2 5.7-3.14 7.71l-1.42-1.42A8.94 8.94 0 0 0 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.73 4.73 1.27-1.27L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="volume-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77Z"
            />
          </svg>
        </button>
      </template>

      <div class="volume-panel">
        <el-slider
          class="volume-slider"
          v-model="SongStore.volume"
          vertical
          height="140px"
          :min="0"
          :max="100"
          :show-tooltip="false"
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
  { immediate: true },
)

const toggleMute = () => {
  if (SongStore.volume === 0) {
    SongStore.volume = Math.min(100, Math.max(1, lastNonZeroVolume.value || 50))
  } else {
    SongStore.volume = 0
  }
}

// 主要用于“松手”后确保 lastNonZeroVolume 刷新（部分拖动场景）
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #9ca3af;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  color: #e5e7eb;
}

.volume-btn:active {
  transform: scale(0.98);
}

.volume-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
  color: #e5e7eb;
}

.volume-icon {
  width: 22px;
  height: 22px;
}

.volume-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px;
}

.volume-text {
  font-size: 12px;
  color: rgba(229, 231, 235, 0.92);
  line-height: 1;
  user-select: none;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.volume-text.muted {
  color: rgba(252, 165, 165, 0.95);
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.1);
}
</style>

<style>
/* popover 内容需要全局样式才能覆盖 element-plus popper */
.volume-popper {
  z-index: 10050 !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.88)) !important;
  backdrop-filter: blur(10px);
  padding: 0 !important;
  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.volume-popper .el-slider.is-vertical {
  margin: 0 !important;
}

/* Slider 美化（仅影响音量弹层内） */
.volume-popper .volume-slider {
  padding: 2px 0;
}

.volume-popper .volume-slider.el-slider.is-vertical {
  /* 给圆点留出空间，避免贴边/裁切 */
  width: 24px;
}

.volume-popper .volume-slider.el-slider.is-vertical .el-slider__runway,
.volume-popper .volume-slider.el-slider.is-vertical .el-slider__bar {
  margin: 0 auto;
}

.volume-popper .volume-slider .el-slider__runway {
  width: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 6px 14px rgba(0, 0, 0, 0.22);
}

.volume-popper .volume-slider .el-slider__bar {
  width: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f43f5e 0%, #ef4444 40%, #fb7185 100%);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.38);
}

.volume-popper .volume-slider.el-slider.is-vertical .el-slider__button-wrapper {
  left: 50%;
  transform: translateX(-50%);
}

.volume-popper .volume-slider .el-slider__button-wrapper {
  width: 20px;
  height: 20px;
}

.volume-popper .volume-slider .el-slider__button {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.65));
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.35),
    0 0 0 4px rgba(239, 68, 68, 0.18);
}

.volume-popper .volume-slider .el-slider__button:hover {
  transform: scale(1.06);
}
</style>
