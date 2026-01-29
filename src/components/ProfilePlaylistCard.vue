<template>
  <button type="button" class="playlist-card" @click="goPlaylist(item.id, item.coverImgUrl)">
    <div class="relative overflow-hidden rounded-2xl bg-slate-800/60 aspect-square">
      <img :src="getCover(item.coverImgUrl)" :alt="item.name" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
    </div>
    <p class="playlist-name" :title="item.name">
      {{ item.name }}
    </p>
    <p class="playlist-meta">
      <slot name="meta" :item="item" />
    </p>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
interface PlaylistItem {
  id: number | string
  name: string
  coverImgUrl: string
  playCount?: number
  creator?: {
    nickname?: string
  }
}

defineProps<{
  item: PlaylistItem
}>()
const getCover = (url: string) => `${url}?param=250y250`
const goPlaylist = (id: number | string, coverImgUrl: string) => {
  console.log(coverImgUrl)
  router.push({
    name: 'playlist',
    params: { id },
    query: { coverImgUrl },
  })
}
</script>

<style scoped>
.playlist-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.playlist-card:hover {
  transform: translateY(-2px);
}

.playlist-count {
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: rgba(248, 250, 252, 0.98);
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-meta {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.95);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
