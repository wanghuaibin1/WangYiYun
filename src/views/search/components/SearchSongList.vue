<template>
  <div class="space-y-3">
    <article
      v-for="song in songs"
      :key="song.id"
      class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition"
    >
      <img
        :src="song.al?.picUrl"
        alt="cover"
        class="h-14 w-14 rounded-lg object-cover border border-white/10"
      />
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
        <p class="text-xs text-slate-400 truncate">{{ formatArtists(song.ar) }}</p>
      </div>
      <div class="text-xs text-slate-400 w-14 text-right">{{ formatDuration(song.dt) }}</div>
      <button class="ghost-btn px-3 py-1 text-xs" @click="emitPlay(song)">播放</button>
    </article>

    <p v-if="!songs?.length" class="py-8 text-center text-slate-400">{{ emptyText }}</p>
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

const formatArtists = (artists: { name: string }[] = []) => artists.map((a) => a.name).join(' / ')
const formatDuration = (ms?: number) => (ms ? formatTime(ms) : '--:--')

const vipTag = (fee?: number) => {
  // fee: 0 免费/无版权；1 VIP；4 购买专辑；8 非会员低音质试听，会员高音质/下载
  if (fee === 1) {
    return { text: 'VIP', title: 'VIP 歌曲', class: 'border-amber-400/40 text-amber-300 bg-amber-400/10' }
  }
  // if (fee === 8) {
  //   return {
  //     text: 'VIP',
  //     title: '非会员可低音质试听，会员可高音质/下载',
  //     class: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
  //   }
  // }
  return null
}

const emitPlay = (song: Song) => emit('play', song)

// avoid unused warning if future refactors remove direct usage
void props
</script>

