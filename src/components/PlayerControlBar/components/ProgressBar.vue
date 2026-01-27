<template>
  <div class="flex items-center space-x-2 w-80">
<!--    <p class="text-xs text-gray-400">{{ SongStore.formatCurrentTime }}</p>-->
    <!-- 进度条 -->
    <input
      type="range"
      ref="progressBar"
      min="0"
      :max="maxTime"
      v-model="localRate"
      @input="handleInput"
      @change="handleChange"
      class="progress-bar"
      style="border-radius: 3px"
    />
<!--    <p class="text-xs text-gray-400">{{ formatTime(SongStore.currentSong.dt) }}</p>-->
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/format.ts'
import { useSongStore } from '@/stores/modules/song.ts'
import { ref, defineExpose, computed, watch } from 'vue'

const SongStore = useSongStore()
const progressBar = ref<HTMLInputElement>()
// 定义事件
const emit = defineEmits(['updateData'])

const props = withDefaults(defineProps<{
  /**
   * 缓冲进度（0~1），用于展示缓冲条，不限制播放/拖动
   */
  bufferedPercent?: number
}>(), {
  bufferedPercent: 0,
})
// 最大时间（歌曲时长）
const maxTime = computed(() => SongStore.currentSong.dt / 1000)
const localRate = ref(0)

// 监听歌曲变化，重置进度条
watch(
  () => SongStore.currentSong.id,
  () => {
    localRate.value = 0
    progressBackground()
  },
)

// 双向绑定 localRate 和 SongStore.currentTime
watch(
  () => SongStore.currentTime,
  (newTime) => {
    if (isUserDragging.value) localRate.value = newTime // 同步当前播放时间到 localRate
  },
)

watch(
  () => props.bufferedPercent,
  () => {
    progressBackground()
  },
)

const isUserDragging = ref<boolean>(true)
// 用户拖动时触发的事件
const handleInput = () => {
  isUserDragging.value = false
  progressBackground()
}
// 用户松开滑块时触发的事件
const handleChange = () => {
  isUserDragging.value = true
  SongStore.currentTime = localRate.value
  emit('updateData', { currentTime: SongStore.currentTime })
}
//进度条背景颜色
const progressBackground = () => {
  const duration = maxTime.value || 0
  if (!duration || !Number.isFinite(duration) || duration <= 0) return

  const playedPct = Math.min(100, Math.max(0, (localRate.value / duration) * 100))
  const bufferedPct = Math.min(100, Math.max(playedPct, (props.bufferedPercent || 0) * 100))

  requestAnimationFrame(() => {
    if (progressBar.value) {
      // 三段：已播放(红) / 已缓冲(浅灰) / 未缓冲(深灰)
      progressBar.value.style.background = `linear-gradient(to right, #c7424d ${playedPct}%, #8b8b93 ${playedPct}%, #8b8b93 ${bufferedPct}%, #4d4d56 ${bufferedPct}%)`
    }
  })
}

defineExpose({
  progressBackground,
})
</script>

<style scoped>
/*横条样式*/
input[type='range'] {
  -webkit-appearance: none;
  /*清除系统默认样式*/
  width: 100%;
  background:
    -webkit-linear-gradient(#fd3e4a, #fd3e4a) no-repeat,
    #4d4d56;
  /*设置左边颜色为#61bd12，右边颜色为#ddd*/
  background-size: 0% 100%;
  /*设置左右宽度比例*/
  height: 5px;
  /*横条的高度*/
}

/*拖动块的样式*/
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  /*清除系统默认样式*/
  height: 15px;
  /*拖动块高度*/
  width: 15px;
  /*拖动块宽度*/
  background: #fff;
  /*拖动块背景*/
  border-radius: 50%;
  /*外观设置为圆形*/
  border: solid 1px #ddd;
  /*设置边框*/
  opacity: 0;
}

input[type='range']:hover::-webkit-slider-thumb {
  opacity: 1;
}
</style>
