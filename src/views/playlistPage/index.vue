<template>
  <div class="playlist-root">
    <!-- 遮罩层 -->
    <div
      class="overlay"
      @click="closePlayList"
    ></div>

    <!-- 播放列表容器 -->
    <div
      ref="playlistPanelRef"
      class="playlist-panel z-[9999] bg-[#2d2d38]/95 backdrop-blur fixed top-1/2 right-0 -translate-y-1/2 w-[90%] sm:w-[60%] md:w-[40%] lg:w-[28%] h-[75%] rounded-l-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden"
      @click.stop
    >
      <div
        ref="container"
        class="w-full h-full overflow-x-hidden"
        style="scrollbar-width: none; scroll-behavior: smooth"
        @scroll="throttledLazyLoad"
      >
        <!-- 播放列表头部 -->
        <div
          class="flex justify-between items-center sticky top-0 z-10 bg-[#2d2d38]/95 backdrop-blur p-4 border-b border-white/10"
        >
          <div class="flex w-1/2 items-center">
            <h1 class="text-xl font-bold text-white">播放列表</h1>
<!--          <span class="text-xl text-[rgb(142,142,142)]">-->
<!--            {{ SongStore.playList.length }}-->
<!--          </span>-->
          </div>
          <div class="w-1/2 flex justify-end">
            <button
              class="mr-3 text-[rgb(142,142,142)] hover:text-white transition-colors cursor-pointer"
              @click="closePlayList"
              title="关闭"
            >
              关闭
            </button>
            <span
              class="text-[rgb(142,142,142)] hover:text-white transition-colors cursor-pointer"
              @click="clearList"
            >
              清空列表
            </span>
          </div>
        </div>

        <!-- 播放列表内容 -->
        <div ref="child">
          <ul class="infinite-list pt-2 pb-3">
            <PlayList
              v-for="(item, index) in songList.list"
              :key="index"
              :index="index"
              :item="item"
            />
            <!-- 加载动画 -->
            <div v-if="loading" class="h-12 flex justify-center items-center">
              <div
                class="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 w-12 h-12 aspect-square rounded-full"
              >
                <div
                  class="rounded-full h-full w-full bg-slate-100 dark:bg-zinc-900"
                ></div>
              </div>
            </div>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'

import PlayList from './component/PlaylistItem.vue'

const SongStore = useSongStore()
const loading = ref(false)
const container = ref(null)
const child = ref(null)
const num = ref(0)
const songList = reactive({ list: [] })
const playlistPanelRef = ref<HTMLElement | null>(null)

// 关闭播放列表（用于遮罩/按钮等场景，避免 toggle 带来的边界问题）
const closePlayList = () => {
  SongStore.playListDisplay = false
}

// 获取更多歌曲
const getPlaylist = () => {
  if (loading.value) return
  loading.value = true
  setTimeout(() => {
    const newSongs = SongStore.playList.slice(num.value, num.value + 10)
    if (newSongs.length) {
      songList.list.push(...newSongs)
      num.value += newSongs.length
    }
    loading.value = false
  }, 500) // 优化加载时间为 500ms
}

// 检查是否接近容器底部
const isNearBottom = () => {
  if (container.value && child.value) {
    const { bottom } = child.value.getBoundingClientRect()
    const { innerHeight } = window
    return bottom <= innerHeight + 50 // 提前加载
  }
  return false
}

// 懒加载逻辑
const lazyLoad = () => {
  if (num.value < SongStore.playList.length && isNearBottom()) {
    getPlaylist()
  }
}

// 节流函数
const throttle = (fn, delay) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}
const throttledLazyLoad = throttle(lazyLoad, 200)

// 清空播放列表
const clearList = () => {
  songList.list = []
  num.value = 0
}

// 初始化加载
onMounted(() => {
  getPlaylist()
})

// 点击面板外关闭：使用捕获阶段监听，避免歌词页/其它遮罩层拦截导致 overlay 收不到点击
const onGlobalPointerDown = (e: PointerEvent) => {
  if (!SongStore.playListDisplay) return
  const panel = playlistPanelRef.value
  const targetEl = e.target as HTMLElement | null
  const target = targetEl as Node | null
  if (!panel || !target) return
  // 点击“播放列表开关按钮”时，不走点外关闭；否则会出现 close 后又被 toggle 打开
  if (targetEl?.closest?.('[data-playlist-toggle]')) return
  if (!panel.contains(target)) closePlayList()
}

onMounted(() => {
  document.addEventListener('pointerdown', onGlobalPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onGlobalPointerDown, true)
})

// 监听播放列表变化
watch(
  () => SongStore.playList,
  () => {
    clearList()
    getPlaylist()
  },
  { deep: true },
)
</script>

<style scoped>
.playlist-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.playlist-panel {
  will-change: transform, opacity;
}

/* 由 PlayerLayout.vue 的 <transition name="playlist-pop"> 驱动 */
:global(.playlist-pop-enter-active),
:global(.playlist-pop-leave-active) {
  transition: opacity 220ms ease;
}

:global(.playlist-pop-enter-from),
:global(.playlist-pop-leave-to) {
  opacity: 0;
}

:global(.playlist-pop-enter-active .overlay),
:global(.playlist-pop-leave-active .overlay) {
  transition: opacity 220ms ease;
}

:global(.playlist-pop-enter-from .overlay),
:global(.playlist-pop-leave-to .overlay) {
  opacity: 0;
}

:global(.playlist-pop-enter-active .playlist-panel),
:global(.playlist-pop-leave-active .playlist-panel) {
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease;
}

:global(.playlist-pop-enter-from .playlist-panel),
:global(.playlist-pop-leave-to .playlist-panel) {
  transform: translate3d(16px, -50%, 0) scale(0.98);
  opacity: 0;
}

:global(.playlist-pop-enter-to .playlist-panel),
:global(.playlist-pop-leave-from .playlist-panel) {
  transform: translate3d(0, -50%, 0) scale(1);
  opacity: 1;
}

/* 隐藏滚动条（webkit） */
.playlist-panel ::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
