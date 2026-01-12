<template>
  <!-- 遮罩层 -->
  <div
    class="overlay"
    @click="SongStore.playListDisplay = !SongStore.playListDisplay"
  ></div>

  <!-- 播放列表容器 -->
  <div
    class="z-[9999] bg-[#2d2d38] fixed top-1/2 right-0 transition-all ease-in-out duration-200 -translate-y-1/2 w-[25%] h-[75%]"
    :class="{
      'animate-[Keyplay_.40s_linear]': !SongStore.playListDisplay,
      'animate-[Keyplay2_.40s_linear]': SongStore.playListDisplay,
    }"
  >
    <div
      ref="container"
      class="w-full h-full overflow-x-hidden"
      style="scrollbar-width: none; scroll-behavior: smooth"
      @scroll="throttledLazyLoad"
    >
      <!-- 播放列表头部 -->
      <div
        class="flex justify-between items-center fixed top-0 left-0 right-0 z-10 bg-[#2d2d38] p-4"
      >
        <div class="flex w-1/2 items-center">
          <h1 class="text-xl font-bold text-white">播放列表</h1>
          <span class="text-xl text-[rgb(142,142,142)]">
            {{ SongStore.playList.length }}
          </span>
        </div>
        <div class="w-1/2 flex justify-end">
          <span
            class="text-[rgb(142,142,142)] cursor-pointer"
            @click="clearList"
          >
            清空列表
          </span>
        </div>
      </div>

      <!-- 播放列表内容 -->
      <div ref="child">
        <ul class="infinite-list pt-12">
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
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'

import PlayList from './component/PlaylistItem.vue'

defineComponent({
  name: 'Playlist-index',
})

const SongStore = useSongStore()
const loading = ref(false)
const container = ref(null)
const child = ref(null)
const num = ref(0)
const songList = reactive({ list: [] })

// 切换播放列表显示状态
const togglePlayListDisplay = () => {
  SongStore.playListDisplay = !SongStore.playListDisplay
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
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
</style>
