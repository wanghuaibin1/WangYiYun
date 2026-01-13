<template>
  <div class="relative w-full h-full layout-container-demo">
    <el-container class="layout-container-demo h-full">
      <el-aside width="200px">Aside</el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

    <div class="fixed bottom-0 w-full bg-gray-200">
      <PlayerControlBar />
    </div>
      <PlayListPage v-if="SongStore.playListDisplay"/>
  </div>
</template>

<script setup lang="ts">
import { useSongStore } from '@/stores/modules/song.ts'
import PlayerControlBar from '@/components/player-control-bar/index.vue'
import PlayListPage from '@/views/PlayListPage/index.vue'

const SongStore = useSongStore()

</script>
