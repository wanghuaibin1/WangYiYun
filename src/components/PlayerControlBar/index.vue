<template>
  <div >
    <!--      进度条-->
    <ProgressBar
      ref="progressBarRef"
      :buffered-percent="bufferedPercent"
      @updateData="handleUpdate"
    />
    <div class="bg-gray-800 py-2 text-white px-4 w-full h-full flex items-center justify-between">
      <!-- 左侧部分: 歌曲信息 -->
      <div class="flex w-1/3 items-center space-x-4 opacity-0 sm:opacity-100">
        <!-- 专辑图片或退出图标 -->
        <div
          v-if="!SongStore.songDetailsDisplay"
          class="w-14 h-14 cursor-pointer rounded-full hover:scale-110 ease-linear flex items-center justify-center"
          @click="goToPlayPage"
        >
          <img
            :src="SongStore.currentSong.al.picUrl"
            alt="专辑封面"
            class="w-14 h-14 rounded-full"
            :style="{ transform: `rotate(${rotationAngle}deg)` }"
          />
        </div>
        <!-- 退出图标 -->
        <div
          v-else
          class="w-14 h-14 cursor-pointer rounded-full hover:scale-110 ease-linear flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
          @click="exitPlayPage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
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
              SongStore.songDetailsDisplay
                ? SongStore.currentSong.name
                : SongStore.currentTime === 0
                  ? SongStore.currentSong.name
                  : SongStore.currentTimeLyric.text
            }}
          </p>
          <p class="text-xs mt-2 text-gray-400">
            {{
              SongStore.songDetailsDisplay
                ? artistsName
                : SongStore.currentSong.name
            }}
          </p>
        </div>
      </div>

      <!-- 中间部分: 播放控制 -->
      <div class="flex w-1/3 flex-col items-center">
        <!--      控制块-->
        <PlaybackControls ref="parentRef" />

      </div>
      <!-- 右侧部分: 其他控制选项 -->
      <div class="w-1/3 flex items-center justify-end space-x-4 pr-6 sm:opacity-100 text-gray-400">
        <VolumeControl />
        <div
          class="cursor-pointer"
          data-playlist-toggle
          @click="SongStore.playListDisplay = !SongStore.playListDisplay"
        >
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
  </div>

  <div>
    <!-- 走同源 /__media 代理，确保支持 Range 分段请求(206/Accept-Ranges) -->
    <audio ref="audio" :src="audioUrl" preload="metadata"></audio>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeMount, watch, onBeforeUnmount, nextTick } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import { usePlayer } from '@/hooks/usePlayer.ts'
import { getLyricByTime, formatProgress } from '@/utils/format.ts'
import VolumeControl from './components/VolumeControl.vue'
import PlaybackControls from './components/PlaybackControls.vue'
import ProgressBar from './components/ProgressBar.vue'
const SongStore = useSongStore()
const { player } = usePlayer()
const audio = ref<HTMLAudioElement>()
const parentRef = ref()
const progressBarRef = ref()
const bufferedPercent = ref(0)
const lastAutoPlaySrc = ref<string>('')

// 将第三方直链包一层同源代理，浏览器才能稳定走 Range 分段请求
const audioUrl = computed(() => {
  if (!SongStore.songUrl) return ''
  return `/__media?url=${encodeURIComponent(SongStore.songUrl)}`
})

// 旋转角度状态
const rotationAngle = ref(0)
let animationFrameId: number | null = null
const rotationSpeed = 0.3 // 每帧旋转角度（度），20秒一圈 = 360度 / (20秒 * 60fps) ≈ 0.3度/帧

// 打开全屏播放详情页（不切路由）
const goToPlayPage = () => {
  SongStore.songDetailsDisplay = true
}

// 退出播放详情页
const exitPlayPage = () => {
  SongStore.songDetailsDisplay = false
}

// 计算艺术家名称
const artistsName = computed(() => {
  if (!SongStore.currentSong.ar || SongStore.currentSong.ar.length === 0) {
    return '未知艺术家'
  }
  return SongStore.currentSong.ar.map(artist => artist.name).join(' / ')
})

// 旋转动画函数
const rotateCover = () => {
  if (SongStore.playStatus) {
    rotationAngle.value += rotationSpeed
    animationFrameId = requestAnimationFrame(rotateCover)
  }
}

// 停止旋转动画（但保持当前角度）
const stopRotation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}
watch(
  () => SongStore.currentSong,
  async (cover) => {
    if (cover) {
     await SongStore.setThemeByCover(SongStore.currentSong.al.picUrl)
    }
  },
  { immediate: true }
)
// 监听播放状态
watch(
  () => SongStore.playStatus,
  (newVal) => {
    if (!audio.value) {
      console.warn('音频元件不可用!')
      return
    }
    if (newVal) {
      // 如果还没拿到 URL，先拉取
      if (!SongStore.songUrl) {
        const id = SongStore.playList?.[SongStore.currentIndex]?.id
        if (id) player(id, SongStore.currentIndex)
        return
      }
      audio.value.play().catch((error) => {
        SongStore.playStatus = false
        if (error.name === 'NotAllowedError') {
          alert('播放失败，请允许浏览器播放音频')
        } else if (error.name === 'AbortError') {
          // AbortError 多数是切歌/重新加载导致浏览器取消请求，不等于网络中断
          console.warn('播放被中断(AbortError)：可能是切歌/重新加载导致', error)
        } else {
          console.error('播放失败:', error)
        }
      })
    } else {
      // 暂停音频
      audio.value.pause()
    }
    // 控制封面旋转
    stopRotation()
    if (newVal) {
      rotateCover()
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
    // 重置旋转角度
    rotationAngle.value = 0
    bufferedPercent.value = 0
    // 确保 audio 已定义，并根据播放状态进行控制
    if (audio.value) {
      // 重置音频播放位置
      audio.value.currentTime = 0
      if (SongStore.playStatus) {
        // 播放状态为 true：这里先不强行 play（src 可能还没更新完），交给下面的 audioUrl 监听来做“续播”
      } else {
        // 播放状态为 false，暂停音频
        audio.value.pause()
      }
    }
  },
)

// 播放中切歌：当新 src 真正就绪（songUrl -> audioUrl 变化）时，自动续播
const tryAutoPlay = async () => {
  if (!audio.value) return
  if (!SongStore.playStatus) return
  const src = audioUrl.value
  if (!src) return
  if (src === lastAutoPlaySrc.value) return

  lastAutoPlaySrc.value = src
  await nextTick()

  // 触发加载新资源，再尝试播放；readyState 不够就等 canplay 再播一次
  const el = audio.value
  try {
    el.load()
    await el.play()
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      // 多数是切歌/重新加载导致，等 canplay 再试一次
      const once = async () => {
        el.removeEventListener('canplay', once)
        if (!SongStore.playStatus) return
        try {
          await el.play()
        } catch (e) {
          console.error('自动续播失败:', e)
        }
      }
      el.addEventListener('canplay', once, { once: true })
      return
    }
    console.error('自动续播失败:', error)
  }
}

watch(
  () => audioUrl.value,
  () => {
    tryAutoPlay()
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

// 标记是否正在更新音频（避免循环更新）
let isUpdatingAudio = false

// 监听 currentTime 的变化，如果是从外部设置的（比如从歌词跳转），更新音频
watch(
  () => SongStore.currentTime,
  (newTime) => {
    if (!audio.value || isUpdatingAudio) return
    // 检查是否是用户通过进度条拖动的（通过检查 audio 的 currentTime 是否接近）
    const audioTime = audio.value.currentTime
    const timeDiff = Math.abs(audioTime - newTime)
    // 如果时间差大于 0.5 秒，说明是从外部设置的，需要更新音频
    if (timeDiff > 0.5) {
      isUpdatingAudio = true
      audio.value.currentTime = newTime
      // 重置标志
      setTimeout(() => {
        isUpdatingAudio = false
      }, 100)
    }
  }
)

// 监听 shouldSyncAudioTime 标志，当从歌词跳转时更新音频
watch(
  () => SongStore.shouldSyncAudioTime,
  (shouldSync) => {
    if (shouldSync && audio.value) {
      isUpdatingAudio = true
      audio.value.currentTime = SongStore.currentTime
      SongStore.shouldSyncAudioTime = false
      setTimeout(() => {
        isUpdatingAudio = false
      }, 100)
    }
  }
)

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

// 更新缓冲进度（不限制播放/拖动，只用于展示缓冲条）
const handleProgress = () => {
  const el = audio.value
  if (!el) return
  const duration = el.duration
  if (!duration || !Number.isFinite(duration) || duration <= 0) return
  if (!el.buffered || el.buffered.length <= 0) return

  // 取最后一个 buffered 区间的 end，通常更准确
  const end = el.buffered.end(el.buffered.length - 1)
  bufferedPercent.value = Math.max(0, Math.min(1, end / duration))
}
onBeforeMount(() => {
  player(SongStore.playList[SongStore.currentIndex].id, SongStore.currentIndex)
})

onMounted(async () => {
  // 通过 timeupdate 事件监听器获取当前播放进度，并更新播放进度以及歌词内容
  audio.value.addEventListener('timeupdate', handleTimeUpdate)
  audio.value.addEventListener('ended', handleEnded)
  audio.value.addEventListener('progress', handleProgress)
  audio.value.addEventListener('loadedmetadata', handleProgress)

  // 组件挂载时，如果正在播放则开始旋转
  if (SongStore.playStatus) {
    rotateCover()
  }

  // 存储事件监听器，方便清理
  onBeforeUnmount(() => {
    audio.value.removeEventListener('timeupdate', handleTimeUpdate)
    audio.value.removeEventListener('ended', handleEnded)
    audio.value.removeEventListener('progress', handleProgress)
    audio.value.removeEventListener('loadedmetadata', handleProgress)
    stopRotation()
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

