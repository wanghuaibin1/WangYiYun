<template>
  <div class="flex my-4 hover:bg-[#393944] px-4 py-2">
    <div class="flex w-4/5">
      <div class="cursor-pointer" @click="player(props.item.id,props.index)">
        <el-image :src="props.item.al.picUrl" lazy class="w-12 rounded-lg h-12" />
      </div>
      <div class="h-12 ml-2 flex flex-col justify-center">
        <p
          class="text-base text-white font-semibold leading-6"
          style="
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
          "
        >
          {{ props.item.name }}
        </p>
        <p class="text-xs leading-6 text-[rgb(142,142,142)]">{{ props.item.ar[0].name }}</p>
      </div>
    </div>
    <div class="w-1/5 text-[rgb(142,142,142)] flex justify-center items-center">
      {{ formatTime(props.item.dt) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import {  formatTime } from '@/utils/format'
import { usePlayer } from '@/hooks/usePlayer.ts'


defineComponent({
  name: 'PlaylistItem',
})
const SongStore = useSongStore()
const { player } = usePlayer()
const props = defineProps(['item','index'])
</script>

<style scoped></style>
