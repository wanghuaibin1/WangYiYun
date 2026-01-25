<template>
  <div class="space-y-3">
    <article
      v-for="song in songs"
      :key="song.id"
      class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition"
    >
      <!-- 封面 -->
      <img
        :src="getCover(song)"
        loading="lazy"
        alt="cover"
        class="h-14 w-14 rounded-lg object-cover border border-white/10 shrink-0"
      />

      <!-- 歌曲信息 -->
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-white truncate flex items-center gap-2">
          <span class="truncate">{{ song.name }}</span>

          <span
            v-if="vipTag(song.fee)"
            class="shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] leading-none"
            :class="vipTag(song.fee)!.class"
            :title="vipTag(song.fee)!.title"
          >
            {{ vipTag(song.fee)!.text }}
          </span>
        </p>

        <p class="text-xs text-slate-400 truncate">
          {{ formatArtists(song.ar) }}
        </p>
      </div>

      <!-- 时长 -->
      <div class="text-xs text-slate-400 w-14 text-right tabular-nums">
        {{ formatDuration(song.dt) }}
      </div>

      <!-- 操作 -->
      <button class="ghost-btn px-3 py-1 text-xs" @click="emitPlay(song)">
        播放
      </button>
    </article>

    <p v-if="!songs?.length" class="py-8 text-center text-slate-400">
      {{ emptyText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/types/player'
import { formatTime } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    songs: Song[]
    emptyText?: string
  }>(),
  {
    emptyText: '暂无结果',
  },
)

const emit = defineEmits<{
  play: [song: Song]
}>()

/* ---------- 工具函数 ---------- */

// 网易云封面（列表统一小尺寸）
const getCover = (song: Song) => {
  const pic = song.al?.picUrl
  if (!pic) return '/default-cover.png'
  return `${pic}?param=100y100`
}

const formatArtists = (artists: { name: string }[] = []) =>
  artists.map((a) => a.name).join(' / ')

const formatDuration = (ms?: number) => (ms ? formatTime(ms) : '--:--')

const vipTag = (fee?: number) => {
  if (fee === 1) {
    return {
      text: 'VIP',
      title: 'VIP 歌曲',
      class: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    }
  }
  return null
}

const emitPlay = (song: Song) => emit('play', song)
</script>
