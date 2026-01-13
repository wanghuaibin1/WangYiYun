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
    <transition name="fade">
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
import { useSongStore } from '@/stores/modules/song.ts'
import PlayerControlBar from '@/components/player-control-bar/index.vue'
import PlayListPage from '@/views/PlayListPage/index.vue'
import PlayPage from '@/views/play-page/index.vue'

const SongStore = useSongStore()
</script>
