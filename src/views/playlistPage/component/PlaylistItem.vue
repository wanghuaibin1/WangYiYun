<template>
  <div
    class="flex mx-3 my-1 px-3 py-2 rounded-xl transition-colors select-none"
    :class="
      isActive
        ? 'bg-white/10 ring-1 ring-white/10'
        : 'hover:bg-white/5'
    "
  >
    <div class="flex w-4/5">
      <div class="cursor-pointer" @click="player(props.item.id, props.index)">
        <el-image
          :src="props.item.al.picUrl"
          lazy
          class="w-12 rounded-lg h-12 ring-1 ring-white/10"
        />
      </div>
      <div class="h-12 ml-2 flex flex-col justify-center">
        <p
          class="text-base text-white font-semibold leading-6 flex items-center gap-2"
        >
          <span v-if="isActive" class="playing-indicator" aria-label="正在播放">
            <i></i><i></i><i></i>
          </span>
          <span class="truncate">{{ props.item.name }}</span>
          <span
            v-if="vipTag(props.item.fee)"
            class="shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] leading-none border-amber-400/40 text-amber-300 bg-amber-400/10"
            :title="vipTag(props.item.fee)!"
          >
            VIP
          </span>
        </p>
        <p class="text-xs leading-6 text-[rgb(142,142,142)] truncate">
          {{ props.item.ar?.[0]?.name || '' }}
        </p>
      </div>
    </div>
    <div
      class="w-1/5 text-[rgb(142,142,142)] flex justify-center items-center tabular-nums"
      :class="isActive ? 'text-white/80' : ''"
    >
      {{ formatTime(props.item.dt) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSongStore } from '@/stores/modules/song.ts'
import type { Song } from '@/types/player'
import { formatTime } from '@/utils/format'
import { usePlayer } from '@/hooks/usePlayer.ts'
import { computed } from 'vue'

const SongStore = useSongStore()
const { player } = usePlayer()
const props = defineProps<{
  item: Song
  index: number
}>()

const isActive = computed(() => SongStore.currentSong?.id === props.item.id)

const vipTag = (fee?: number) => {
  if (fee === 1) return 'VIP 歌曲'
  return null
}
</script>

<style scoped>
.playing-indicator {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
  width: 16px;
}

.playing-indicator i {
  display: inline-block;
  width: 3px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
  animation: playlist-eq 1s ease-in-out infinite;
}

.playing-indicator i:nth-child(2) {
  animation-delay: 0.15s;
  opacity: 0.85;
}

.playing-indicator i:nth-child(3) {
  animation-delay: 0.3s;
  opacity: 0.7;
}

@keyframes playlist-eq {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 12px;
  }
}
</style>

<style scoped></style>
