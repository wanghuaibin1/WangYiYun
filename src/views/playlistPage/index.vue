<template>
  <div
    class="overlay"
    @click="SongStore.playListDisplay = !SongStore.playListDisplay"
  ></div>
  <div
    class="z-[9999] bg-[#2d2d38] fixed top-1/2 right-[0%] transition-all ease-in-out duration-200 -translate-y-1/2 w-[25%] h-[75%]"
    style="animation-fill-mode: forwards"
    :class="{
      'animate-[Keyplay_.40s_linear]': !SongStore.playListDisplay,
      'animate-[Keyplay2_.40s_linear]': SongStore.playListDisplay,
    }"
  >
    <div
      ref="container"
      class="w-full h-full overflow-x-hidden container"
      style="scrollbar-width: none; scroll-behavior: smooth"
      @scroll="throttledLazyLoad"
    >
      <div
        class="flex justify-between items-center fixed top-0 left-0 right-0 z-10 from-black to-transparent bg-[#2d2d38] p-4"
      >
        <div class="flex w-1/2 items-center">
          <h1 class="text-2xl font-bold text-white">播放列表</h1>
          <span class="text-xl text-[rgb(142,142,142)]">{{ SongStore.playList.length }}</span>
        </div>
        <div class="w-1/2 flex justify-end">
          <span class="text-[rgb(142,142,142)] cursor-pointer" @click="clearList">清空列表</span>
        </div>
      </div>

      <div ref="child">
        <ul class="infinite-list pt-12">
          <PlayList :item="item" v-for="(item, index) in songList.list" :key="index" />
          <div v-if="loading" class="h-12 flex justify-center items-center">
            <div
              class="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 w-12 h-12 aspect-square rounded-full"
            >
              <div
                class="rounded-full h-full w-full bg-slate-100 dark:bg-zinc-900 background-blur-md"
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
const loading = ref<boolean>(false)
const container = ref()
const child = ref()
const num = ref<number>(0)
const songList = reactive({ list: [] })

// 获取更多歌曲并添加到当前渲染的列表
const getPlaylist = () => {
  if (loading.value) return // 如果已经在加载中，直接返回
  // 显示加载动画
  loading.value = true
  // 使用 setTimeout 模拟异步加载，确保加载动画有时间显示
  setTimeout(() => {
    const newSongs = SongStore.playList.slice(num.value, num.value + 10)
    if (newSongs.length) {
      songList.list.push(...newSongs)
      num.value += 10
    }
    // 加载完成后隐藏加载动画
    loading.value = false
  }, 2000) // 模拟 2000ms 的延迟，可根据需求调整
}
// 检查子元素是否接近容器底部
const isShow = () => {
  if (container.value && child.value) {
    const childRect = child.value.getBoundingClientRect()
    return childRect.bottom < 650
  }
  return false
}

// 懒加载逻辑
const lazyLoad = () => {
  if (num.value < SongStore.playList.length && isShow()) {
    getPlaylist()
  }
}

// 节流函数
const throttle = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn()
        timer = null
      }, delay)
    }
  }
}
const throttledLazyLoad = throttle(lazyLoad, 10)

// 清空列表
const clearList = () => {
  songList.list = []
  num.value = 0
}

// 初始化加载前10首歌
onMounted(() => {
  getPlaylist()
})
// 监听播放列表的变化
watch(
  () => SongStore.playList,
  () => {
    songList.list = []
    num.value = 0
    getPlaylist()
  },
  { deep: true },
)
</script>
<style scoped>
/* 遮盖层样式 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
</style>
