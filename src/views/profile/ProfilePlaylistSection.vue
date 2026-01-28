<template>
  <section class="mt-6 space-y-4">
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="section-title">{{ title }}</h2>
      <span class="section-subtitle">{{ count }} 个歌单</span>
    </div>
    <div v-if="playlists.length" class="playlist-grid">
      <button
        v-for="item in playlists"
        :key="item.id"
        type="button"
        class="playlist-card"
      >
        <div class="relative overflow-hidden rounded-2xl bg-slate-800/60 aspect-square">
          <img :src="item.coverImgUrl" :alt="item.name" class="w-full h-full object-cover" />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
          />
          <span class="playlist-count"> {{ item.trackCount || 0 }} 首 </span>
        </div>
        <p class="playlist-name" :title="item.name">
          {{ item.name }}
        </p>
        <p class="playlist-meta">
          <slot name="meta" :item="item" />
        </p>
      </button>
    </div>
    <p v-else class="empty-text">{{ emptyText }}</p>
  </section>
</template>

<script setup lang="ts">
interface PlaylistItem {
  id: number | string
  name: string
  coverImgUrl: string
  trackCount?: number
  playCount?: number
  creator?: {
    nickname?: string
  }
}

defineProps<{
  title: string
  count: number
  playlists: PlaylistItem[]
  emptyText: string
}>()
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #f9fafb;
}

.section-subtitle {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

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

.empty-text {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.9);
}
</style>


