<template>
  <div class="relative w-full h-full layout-container-demo">
    <!-- 底层：正常页面布局（首页、歌单等） -->
    <el-container class="layout-container-demo h-full">
      <el-aside width="200px">Aside</el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 中层：播放详情页，全屏覆盖在普通页面上，但在播放栏下面 -->
    <transition
      name="play-page"
      @enter="onPlayPageEnter"
      @after-leave="onPlayPageAfterLeave"
    >
      <div
        v-if="SongStore.songDetailsDisplay"
        class="absolute h-screen inset-0 z-[9000]"
      >
        <PlayPage />
      </div>
    </transition>

    <!-- 顶层：底部播放栏，永远在最上层 -->
    <div class="fixed bottom-0 w-full h-[5rem] bg-gray-200 z-[10000]">
      <PlayerControlBar />
    </div>

    <!-- 播放列表弹层（叠在最上面） -->
    <PlayListPage v-if="SongStore.playListDisplay" />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import PlayerControlBar from '@/components/player-control-bar/index.vue'
import PlayListPage from '@/views/PlayListPage/index.vue'
import PlayPage from '@/views/play-page/index.vue'

const SongStore = useSongStore()

// 保存滚动位置
let savedScrollY = 0

// 播放详情页进入时：禁用滚动
const onPlayPageEnter = () => {
  // 保存当前滚动位置
  savedScrollY = window.scrollY
  // 禁用 body 滚动
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.width = '100%'
}

// 播放详情页完全离开后：恢复滚动（在动画结束后执行）
const onPlayPageAfterLeave = () => {
  // 恢复 body 滚动
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  // 恢复滚动位置
  window.scrollTo(0, savedScrollY)
  savedScrollY = 0
}

// 组件卸载时恢复滚动
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
})
</script>

<style scoped>
/* 播放详情页过渡动画 */
.play-page-enter-active,
.play-page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.play-page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.play-page-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-page-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
</style>
