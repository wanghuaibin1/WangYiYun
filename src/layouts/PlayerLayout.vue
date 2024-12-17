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

    <div class="fixed bottom-0 w-full h-[50px] bg-gray-200">
      <PlayerControlBar />
    </div>

  </div>
</template>

<script setup lang="ts">
import PlayerControlBar from '@/views/PlayerControlBar/index.vue'
</script>
