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
            class="w-72 h-72 rounded-2xl shadow-2xl object-cover"
            :class="{ 'animate-spin': SongStore.playStatus }"
            style="animation-duration: 20s;"
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
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <div
          ref="lyricListRef"
          class="flex-1 w-full max-w-2xl mx-auto overflow-y-auto pr-4 lyric-scroll scroll-smooth"
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
                class="text-gray-400 transition-all duration-300"
                :class="{
                  'text-white text-xl font-semibold scale-110': isCurrentLyric(item),
                  'text-gray-500': !isCurrentLyric(item) && index < currentLyricIndex,
                  'text-gray-600': !isCurrentLyric(item) && index > currentLyricIndex,
                }"
              >
                <p v-if="item.text" class="mb-1">{{ item.text }}</p>
                <p v-if="item.translate_intoChinese" class="text-sm text-gray-500">
                  {{ item.translate_intoChinese }}
                </p>
              </div>
            </template>

            <!-- 如果没有歌词，显示占位 -->
            <div v-else class="text-gray-500 text-center py-20">
              <p class="text-lg mb-2">暂无歌词</p>
              <p class="text-sm">歌词加载中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'

const SongStore = useSongStore()
const lyricListRef = ref<HTMLElement | null>(null)
const lyricRefs = ref<HTMLElement[]>([])
const topPadding = ref(0)

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
    const container = lyricListRef.value
    const target = lyricRefs.value[newIndex]
    if (!container || !target) return

    const containerHeight = container.clientHeight
    const targetOffset = target.offsetTop
    const targetHeight = target.clientHeight
    // 第一行直接从顶部开始滚动，避免先停顿再移动的感觉
    const scrollTop =
      newIndex === 0
        ? 0
        : targetOffset - containerHeight / 2 + targetHeight / 2

    smoothScrollTo(container, scrollTop)
  },
  { immediate: true }
)
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
