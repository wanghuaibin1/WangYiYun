<template>
  <!-- 整体背景容器，预留底部播放栏高度（pb-32 大约 8rem，可按需调） -->
  <div
    class="h-full w-full bg-gradient-to-b from-gray-900 to-black text-white px-12 py-10 pb-16 box-border"
  >
    <!-- 左封面 / 右歌词的两列布局 -->
    <div class="h-full w-full max-w-6xl mx-auto flex gap-10 items-center">
      <!-- 左侧：封面 + 基本信息 -->
      <div class="w-[40%] min-w-[360px] flex flex-col items-center justify-center">
        <!-- 专辑封面 -->
        <div class="mb-8">
          <img
            :src="SongStore.currentSong.al?.picUrl || ''"
            alt="专辑封面"
            class="w-72 h-72 rounded-full shadow-2xl object-cover"
            :style="{ transform: `rotate(${rotationAngle}deg)` }"
          />
        </div>

        <!-- 歌曲名称 -->
        <h1 class="text-3xl font-bold mb-3 text-center truncate max-w-full">
          {{ SongStore.currentSong.name || '暂无歌曲' }}
        </h1>

        <!-- 艺术家信息 -->
        <p class="text-gray-400 text-lg mb-2 text-center">
          {{ artistsName }}
        </p>

        <!-- 专辑名称 -->
        <p class="text-gray-500 text-sm text-center">
          {{ SongStore.currentSong.al?.name || '' }}
        </p>
      </div>

      <!-- 右侧：歌词滚动区域 -->
      <div class="flex-1 flex flex-col h-full overflow-hidden relative">
        <div
          ref="lyricListRef"
          class="flex-1 w-full max-w-2xl mx-auto overflow-y-auto pr-4 lyric-scroll scroll-smooth"
          @scroll="() => updateCenterLyric(true)"
        >
          <div
            class="text-center space-y-4 py-4"
            :style="{
              paddingTop: topPadding + 'px',
              paddingBottom: topPadding + 'px',
            }"
          >
            <!-- 如果有歌词 -->
            <template v-if="SongStore.lyric && SongStore.lyric.length > 0">
              <div
                v-for="(item, index) in SongStore.lyric"
                :key="index"
                :ref="el => (lyricRefs[index] = el as HTMLElement)"
                class="text-gray-400 transition-all duration-300 relative"
                :class="{
                  'text-white text-xl font-semibold scale-110': isCurrentLyric(item) || (currentLyricIndex === -1 && isCenterLyric(index)),
                  'text-gray-500': !isCurrentLyric(item) && !(currentLyricIndex === -1 && isCenterLyric(index)) && index < currentLyricIndex,
                  'text-gray-600': !isCurrentLyric(item) && !(currentLyricIndex === -1 && isCenterLyric(index)) && index > currentLyricIndex,
                }"
              >
                <div class="flex items-center justify-center">
                  <div class="text-center">
                    <p v-if="item.text" class="mb-1">{{ item.text }}</p>
                    <p v-if="item.translate_intoChinese" class="text-sm text-gray-500">
                      {{ item.translate_intoChinese }}
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- 如果没有歌词，显示占位 -->
            <div v-else class="text-gray-500 text-center py-20">
              <p class="text-lg mb-2">暂无歌词</p>
              <p class="text-sm">歌词加载中...</p>
            </div>
          </div>
        </div>
        <!-- 固定在中间位置的时间按钮，只在手动滚动时显示 -->
        <button
          v-if="isManualScrolling && centerLyricIndex >= 0 && SongStore.lyric && SongStore.lyric[centerLyricIndex]"
          @click="seekToLyric(SongStore.lyric[centerLyricIndex].time)"
          class="absolute right-4 top-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-200 px-3 py-1.5 text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-full border border-gray-600 hover:border-gray-500 whitespace-nowrap z-10"
          title="从此处开始播放"
        >
          {{ formatLyricTime(SongStore.lyric[centerLyricIndex].time) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import { formatProgress } from '@/utils/format.ts'

const SongStore = useSongStore()
const lyricListRef = ref<HTMLElement | null>(null)
const lyricRefs = ref<HTMLElement[]>([])
const topPadding = ref(0)
const rotationAngle = ref(0)
let animationFrameId: number | null = null
const rotationSpeed = 0.3 // 每帧旋转角度（度），20秒一圈 = 360度 / (20秒 * 60fps) ≈ 0.3度/帧
const centerLyricIndex = ref(-1) // 当前居中显示的歌词索引
const isManualScrolling = ref(false) // 是否是用户手动滚动
let manualScrollTimer: number | null = null // 手动滚动停止的定时器
const isAutoScrolling = ref(false) // 是否是自动滚动
const autoScrollPaused = ref(false) // 是否暂停自动滚动
let resumeAutoScrollTimer: number | null = null // 恢复自动滚动的定时器

// 使用浏览器原生平滑滚动，避免自定义动画可能带来的卡顿/抖动
const smoothScrollTo = (container: HTMLElement, to: number) => {
  container.scrollTo({
    top: to,
    behavior: 'smooth',
  })
}

// 计算艺术家名称
const artistsName = computed(() => {
  if (!SongStore.currentSong.ar || SongStore.currentSong.ar.length === 0) {
    return '未知艺术家'
  }
  return SongStore.currentSong.ar.map(artist => artist.name).join(' / ')
})

// 当前歌词索引
const currentLyricIndex = computed(() => {
  if (!SongStore.lyric || SongStore.lyric.length === 0) {
    return -1
  }
  const currentLyric = SongStore.currentTimeLyric
  if (!currentLyric || !currentLyric.text) {
    return -1
  }
  return SongStore.lyric.findIndex(
    lyric => lyric.time === currentLyric.time && lyric.text === currentLyric.text
  )
})

// 判断是否是当前播放的歌词
const isCurrentLyric = (lyric: { time: number; text: string }) => {
  const current = SongStore.currentTimeLyric
  return current && current.time === lyric.time && current.text === lyric.text
}

// 格式化歌词时间显示
const formatLyricTime = (time: number) => {
  return formatProgress(time)
}

// 判断是否是居中显示的歌词
const isCenterLyric = (index: number) => {
  return centerLyricIndex.value === index
}

// 跳转到指定歌词时间
const seekToLyric = (time: number) => {
  // 使用 $patch 批量更新 state，这是 Pinia 推荐的方式
  SongStore.$patch({
    currentTime: time,
    formatCurrentTime: formatProgress(time),
    playProgressBarRate: time,
    shouldSyncAudioTime: true,
  })

  // 点击按钮跳转时，立即恢复自动滚动
  autoScrollPaused.value = false

  // 清除恢复自动滚动的定时器
  if (resumeAutoScrollTimer !== null) {
    clearTimeout(resumeAutoScrollTimer)
    resumeAutoScrollTimer = null
  }

  // 隐藏手动滚动按钮
  isManualScrolling.value = false
  if (manualScrollTimer !== null) {
    clearTimeout(manualScrollTimer)
    manualScrollTimer = null
  }
}

// 计算当前居中显示的歌词
const updateCenterLyric = (isManual = false) => {
  const container = lyricListRef.value
  if (!container || !SongStore.lyric || SongStore.lyric.length === 0) {
    centerLyricIndex.value = -1
    return
  }

  const containerRect = container.getBoundingClientRect()
  const containerCenterY = containerRect.top + containerRect.height / 2

  // 找到最接近中心位置的歌词
  let closestIndex = -1
  let minDistance = Infinity

  lyricRefs.value.forEach((lyricEl, index) => {
    if (!lyricEl) return

    const rect = lyricEl.getBoundingClientRect()
    const lyricCenterY = rect.top + rect.height / 2

    // 计算歌词中心到容器中心的距离
    const distance = Math.abs(lyricCenterY - containerCenterY)

    // 如果歌词在可视区域内，且距离更近，则更新
    if (rect.bottom >= containerRect.top && rect.top <= containerRect.bottom) {
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    }
  })

  // 如果找到了居中的歌词，更新索引
  // 如果没找到（比如初始化时），且当前没有播放的歌词，则默认选中第一句
  if (closestIndex === -1 && currentLyricIndex.value === -1) {
    closestIndex = 0
  }

  centerLyricIndex.value = closestIndex

  // 如果是手动滚动，显示按钮并设置定时器
  if (isManual && !isAutoScrolling.value) {
    isManualScrolling.value = true

    // 暂停自动滚动
    autoScrollPaused.value = true

    // 清除之前的恢复定时器
    if (resumeAutoScrollTimer !== null) {
      clearTimeout(resumeAutoScrollTimer)
    }

    // 清除之前的按钮隐藏定时器
    if (manualScrollTimer !== null) {
      clearTimeout(manualScrollTimer)
    }

    // 设置新的定时器，2秒后隐藏按钮
    manualScrollTimer = window.setTimeout(() => {
      isManualScrolling.value = false
      manualScrollTimer = null
    }, 2000)

    // 设置新的定时器，3秒后恢复自动滚动
    resumeAutoScrollTimer = window.setTimeout(() => {
      autoScrollPaused.value = false
      resumeAutoScrollTimer = null
    }, 2000)
  }
}

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

// 监听播放状态，控制旋转
watch(
  () => SongStore.playStatus,
  (newVal) => {
    stopRotation()
    if (newVal) {
      rotateCover()
    }
    // 暂停时不重置角度，保持当前角度
  }
)

// 监听当前歌曲变化，重置旋转角度
watch(
  () => SongStore.currentSong,
  () => {
    rotationAngle.value = 0
  }
)

// 歌词加载/切歌时，让第一句歌词静态居中（即使还没开始播放）
watch(
  () => SongStore.lyric,
  async newLyric => {
    if (!newLyric || newLyric.length === 0) {
      topPadding.value = 0
      return
    }

    await nextTick()

    const container = lyricListRef.value
    const first = lyricRefs.value[0]
    if (!container || !first) return

    const containerHeight = container.clientHeight
    const targetHeight = first.clientHeight
    topPadding.value = Math.max(0, containerHeight / 2 - targetHeight / 2)

    // 切歌/刷新后回到顶部，让第一句一开始就在中间
    container.scrollTo({ top: 0, behavior: 'auto' })
  },
  { immediate: true }
)

// 将当前歌词行滚动到容器中间
watch(
  () => currentLyricIndex.value,
  newIndex => {
    if (newIndex === -1) return

    // 如果自动滚动被暂停（用户正在手动滚动），则不执行自动滚动
    if (autoScrollPaused.value) {
      return
    }

    const container = lyricListRef.value
    const target = lyricRefs.value[newIndex]
    if (!container || !target) return

    // 标记为自动滚动
    isAutoScrolling.value = true
    // 清除手动滚动状态
    isManualScrolling.value = false
    if (manualScrollTimer !== null) {
      clearTimeout(manualScrollTimer)
      manualScrollTimer = null
    }

    const containerHeight = container.clientHeight
    const targetOffset = target.offsetTop
    const targetHeight = target.clientHeight
    // 第一行直接从顶部开始滚动，避免先停顿再移动的感觉
    const scrollTop =
      newIndex === 0
        ? 0
        : targetOffset - containerHeight / 2 + targetHeight / 2

    smoothScrollTo(container, scrollTop)

    // 滚动后更新居中歌词，并重置自动滚动标记
    setTimeout(() => {
      updateCenterLyric(false)
      // 延迟重置自动滚动标记，确保滚动完成
      setTimeout(() => {
        isAutoScrolling.value = false
      }, 300)
    }, 100)
  },
  { immediate: true }
)

// 监听歌词变化，更新居中歌词
watch(
  () => SongStore.lyric,
  async () => {
    await nextTick()
    updateCenterLyric()
  }
)

onMounted(() => {
  // 组件挂载时，如果正在播放则开始旋转
  if (SongStore.playStatus) {
    rotateCover()
  }
  // 初始化居中歌词
  nextTick(() => {
    updateCenterLyric()
  })
})

onBeforeUnmount(() => {
  stopRotation()
  // 清理手动滚动定时器
  if (manualScrollTimer !== null) {
    clearTimeout(manualScrollTimer)
    manualScrollTimer = null
  }
  // 清理恢复自动滚动定时器
  if (resumeAutoScrollTimer !== null) {
    clearTimeout(resumeAutoScrollTimer)
    resumeAutoScrollTimer = null
  }
})
</script>

<style scoped>
/* 自定义滚动条样式 */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 隐藏歌词滚动条 */
.lyric-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.lyric-scroll::-webkit-scrollbar {
  display: none;
}
</style>
