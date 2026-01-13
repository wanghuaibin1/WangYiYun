<template>
  <div class="bg-gray-800 py-2 text-white px-4 w-full h-full flex items-center justify-between">
    <!-- 左侧部分: 歌曲信息 -->
    <div class="flex w-1/3 items-center space-x-4 opacity-0 sm:opacity-100">
      <!-- 专辑图片 -->
      <img
        :src="SongStore.currentSong.al.picUrl"
        alt="专辑封面"
        style="animation-fill-mode: forwards"
        class="w-14 h-14 cursor-pointer rounded-full hover:scale-110 ease-linear"
        :class="albumClass"
        @click="SongStore.songDetailsDisplay = !SongStore.songDetailsDisplay"
      />
      <!-- 歌曲和艺术家信息 -->
      <div>
        <p
          class="text-sm font-semibold"
          style="
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
          "
        >
          {{
            SongStore.currentTime === 0
              ? SongStore.currentSong.name
              : SongStore.currentTimeLyric.text
          }}
        </p>
        <p class="text-xs mt-2 text-gray-400">{{ SongStore.currentSong.name }}</p>
      </div>
    </div>

    <!-- 中间部分: 播放控制 -->
    <div class="flex w-1/3 flex-col items-center">
      <!--      控制块-->
      <PlaybackControls ref="parentRef" />
      <!--      进度条-->
      <ProgressBar @updateData="handleUpdate" ref="progressBarRef" />
    </div>
    <!-- 右侧部分: 其他控制选项 -->
    <div class="w-1/3 flex items-center justify-end space-x-4 pr-6 sm:opacity-100 text-gray-400">
      <VolumeControl />
      <div class="cursor-pointer" @click="SongStore.playListDisplay = !SongStore.playListDisplay">
        <svg
          t="1729565872033"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="5118"
          width="28"
          height="28"
        >
          <path
            d="M736 352a32 32 0 0 1 31.264 25.088c4.384 18.816 9.792 32.256 15.232 39.712l2.336 3.008c0.8 0.896 1.088 1.024 1.28 1.024 46.624 0 65.76 39.68 65.088 101.024a32 32 0 0 1-64-0.704c0.192-16.32-1.344-28.16-3.776-34.944l-0.608-1.504-1.92-0.032a65.088 65.088 0 0 1-12.896-2.24V736c0 57.824-66.816 96-144 96S480 793.824 480 736s66.816-96 144-96c29.184 0 56.864 5.44 80.032 15.36L704 384.704c0-1.408 0.032-2.816 0.192-4.224L704 384a32 32 0 0 1 32-32zM416 704a32 32 0 0 1 0 64H224a32 32 0 0 1 0-64h192z m208 0c-46.528 0-80 19.136-80 32s33.472 32 80 32 80-19.136 80-32-33.472-32-80-32zM544 448a32 32 0 0 1 0 64H224a32 32 0 0 1 0-64h320z m256-256a32 32 0 0 1 0 64H224a32 32 0 1 1 0-64h576z"
            fill="#e6e6e6"
            p-id="5119"
          ></path>
        </svg>
      </div>
    </div>
  </div>
  <div>
    <audio ref="audio" :src="SongStore.songUrl"></audio>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onBeforeMount,
  watch,
  onBeforeUnmount,
} from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import { usePlayer } from '@/hooks/usePlayer.ts'
import { getLyricByTime, formatProgress } from '@/utils/format.ts'
import VolumeControl from '@/components/player-control/VolumeControl.vue'
import PlaybackControls from '@/components/player-control/PlaybackControls.vue'
import ProgressBar from '@/components/player-control/ProgressBar.vue'

const SongStore = useSongStore()
const { player } = usePlayer()
const audio = ref<HTMLAudioElement>()
const parentRef = ref()
const progressBarRef = ref()

const albumClass = computed(() => ({
  'animate-[wiggle_10s_linear_infinite]': SongStore.playStatus,
}))
// 监听播放状态
watch(
  () => SongStore.playStatus,
  (newVal) => {
    if (!audio.value) {
      console.warn('音频元件不可用!')
      return
    }
    if (newVal) {
      audio.value.play().catch((error) => {
        SongStore.playStatus = false
        if (error.name === 'NotAllowedError') {
          alert('播放失败，请允许浏览器播放音频')
        } else if (error.name === 'AbortError') {
          alert('播放中断，请检查网络连接')
        } else {
          console.error('播放失败:', error)
        }
      })
    } else {
      // 暂停音频
      audio.value.pause()
    }
  },
)
watch(
  () => SongStore.currentSong,
  () => {
    // 重置播放进度条和相关状态
    SongStore.playProgressBarRate = 0
    SongStore.currentTime = 0
    SongStore.formatCurrentTime = '00:00'
    // 确保 audio 已定义，并根据播放状态进行控制
    if (audio.value) {
      // 重置音频播放位置
      audio.value.currentTime = 0
      if (SongStore.playStatus) {
        audio.value.autoplay = true
        // 播放状态为 true，播放音频
        audio.value.play().catch((error) => console.error('播放失败:', error))
      } else {
        // 播放状态为 false，暂停音频
        audio.value.pause()
      }
    }
  },
)
watch(
  () => SongStore.volume,
  () => {
    audio.value.volume = SongStore.volume / 100
  },
)
// 处理子组件传来的数据
const handleUpdate = (data) => {
  audio.value.currentTime = data.currentTime
}

// 更新逻辑
const handleTimeUpdate = () => {
  requestAnimationFrame(() => {
    progressBarRef.value.progressBackground()
    const curTime = audio.value.currentTime
    SongStore.formatCurrentTime = formatProgress(curTime)
    SongStore.currentTime = curTime
    SongStore.playProgressBarRate = curTime
    const currentLyric = getLyricByTime(curTime, SongStore.lyric)
    if (currentLyric.text && currentLyric.text !== SongStore.currentTimeLyric.text) {
      SongStore.currentTimeLyric = currentLyric
      SongStore.currenLastLy = currentLyric
    }
  })
}
const handleEnded = () => {
  SongStore.nextSong(player)
}
onBeforeMount(() => {
  player(SongStore.playList[SongStore.currentIndex].id, SongStore.currentIndex)
})

onMounted(async () => {
  // 通过 timeupdate 事件监听器获取当前播放进度，并更新播放进度以及歌词内容
  audio.value.addEventListener('timeupdate', handleTimeUpdate)
  audio.value.addEventListener('ended', handleEnded)

  // 存储事件监听器，方便清理
  onBeforeUnmount(() => {
    audio.value.removeEventListener('timeupdate', handleTimeUpdate)
    audio.value.removeEventListener('ended', handleEnded)
  })
})
</script>

<style scoped>
/deep/ .el-slider__runway {
  background-color: #2c3e50;
}

/deep/ .el-slider__bar {
  background-color: #c42323;
}

/deep/ .el-slider__button-wrapper .el-slider__button {
  width: 10px;
  height: 10px;
}
</style>

