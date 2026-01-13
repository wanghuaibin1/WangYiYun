<template>
  <div class="flex items-center space-x-2 w-80">
    <p class="text-xs text-gray-400">{{ SongStore.formatCurrentTime }}</p>
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
    <p class="text-xs text-gray-400">{{ formatTime(SongStore.currentSong.dt) }}</p>
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
  if (SongStore.lyric.length === 0) return
  const value = (localRate.value / SongStore.lyric.at(-1).time) * 100
  requestAnimationFrame(() => {
    if (progressBar.value) {
      progressBar.value.style.background = `linear-gradient(to right, #c7424d ${value}%, #4d4d56 ${value}%)`
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
