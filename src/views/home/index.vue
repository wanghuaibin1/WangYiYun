<template>
  <div
    class="home-page min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-28 pt-10 space-y-12">
      <!-- Hero -->
      <section
        class="home-hero glass-panel rounded-3xl border border-white/10 p-6 sm:p-10 overflow-hidden relative"
      >
        <div
          class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_25%)]"
        />
        <div class="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center relative z-10">
          <div class="space-y-6">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-slate-100 backdrop-blur"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              轻盈 · 流畅 · 沉浸
            </div>
            <div class="space-y-2">
              <h1 class="text-3xl sm:text-4xl font-bold leading-tight text-white">
                发现今天的心动旋律
              </h1>
              <p class="text-base text-slate-200">
                精选推荐、实时歌词、随心播放模式，帮你在忙碌的一天里找到最对味的音乐。
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <a href="#trending" class="primary-btn">立即播放</a>
              <a href="#explore" class="ghost-btn">浏览推荐</a>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm text-slate-200">
              <div class="metric-card">
                <p class="text-xs text-slate-400">曲库</p>
                <p class="text-lg font-semibold text-white">{{ featuredSongs.length }} 首精选</p>
              </div>
              <div class="metric-card">
                <p class="text-xs text-slate-400">播放模式</p>
                <p class="text-lg font-semibold text-white">顺序 · 随机 · 单曲</p>
              </div>
              <div class="metric-card">
                <p class="text-xs text-slate-400">歌词</p>
                <p class="text-lg font-semibold text-white">逐行同步高亮</p>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="hero-card glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <img
                v-if="heroSong"
                :src="heroSong.al?.picUrl || fallbackCover"
                class="h-72 w-full object-cover"
                alt="hero cover"
              />
              <div class="p-5 space-y-3">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Now Playing</p>
                <h3 class="text-xl font-semibold text-white">
                  {{ heroSong?.name || '精选音乐' }}
                </h3>
                <p class="text-sm text-slate-300">
                  {{ formatArtists(heroSong) }}
                </p>
                <div class="flex items-center gap-3 text-xs text-slate-300">
                  <span class="inline-flex items-center gap-1">
                    <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                    流畅播放
                  </span>
                  <span>时长 · {{ formatDuration(heroSong?.dt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 每日推荐歌单（需要登录） -->
      <section class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-emerald-300 font-medium">每日推荐歌单</p>
            <h2 class="text-2xl font-semibold text-white">根据你的口味智能推荐</h2>
          </div>
        </div>

        <div v-if="recommendPlaylists.length" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProfilePlaylistCard
            v-for="item in recommendPlaylists.slice(0, 8)"
            :key="item.id"
            :item="{
              coverImgUrl: item.picUrl,
              name: item.name,
              id: item.id,
              playCount: item.playcount,
            }"
          >
            <template #meta="{ item }"> 播放 {{ formatPlayCount(item.playCount) }} </template>
          </ProfilePlaylistCard>
        </div>
        <p v-else class="text-sm text-slate-400">登录后即可查看每日为你定制的推荐歌单。</p>
      </section>

      <!-- Trending（使用每日推荐歌曲优先展示） -->
      <section id="trending" class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-emerald-300 font-medium">本周热播</p>
            <h2 class="text-2xl font-semibold text-white">为你精选的好歌</h2>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="tag">流行</span>
            <span class="tag">治愈</span>
            <span class="tag">轻快</span>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <article
            v-for="(song, index) in featuredSongs"
            :key="song.id"
            class="song-card glass-panel border border-white/5 rounded-2xl p-4 flex gap-4"
            @click="handlePlaySong(song, index)"
          >
            <img
              :src="song.al?.picUrl || fallbackCover"
              alt="cover"
              class="h-20 w-20 rounded-xl object-cover flex-shrink-0 shadow-lg cursor-pointer"
            />
            <div class="flex flex-col gap-2 min-w-0">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-base font-semibold text-white truncate">{{ song.name }}</h3>
                <span class="text-xs text-slate-400">{{ formatDuration(song.dt) }}</span>
              </div>
              <p class="text-sm text-slate-300 truncate">{{ formatArtists(song) }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/5"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
                  高清音质
                </span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/5"
                >
                  歌词同步
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Song } from '@/types/player'
import { useSongStore } from '@/stores/modules/song.ts'
import { RecommendAPI } from '@/api'
import type { RecommendPlaylist } from '@/api/modules/recommend'
import ProfilePlaylistCard from '@/components/ProfilePlaylistCard.vue'
import { usePlayer } from '@/hooks/usePlayer'

const songStore = useSongStore()
const { player } = usePlayer()
const fallbackCover =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'

const recommendPlaylists = ref<RecommendPlaylist[]>([])
const dailySongs = ref<Song[]>([])

const featuredSongs = computed<Song[]>(() => {
  if (dailySongs.value.length) return dailySongs.value.slice(0, 6)
  return songStore.playList?.slice(0, 6) ?? []
})
const heroSong = computed<Song | undefined>(() => {
  const current = songStore.currentSong
  if (current && current.id) return current
  return featuredSongs.value[0]
})
const sideList = computed<Song[]>(() => {
  if (dailySongs.value.length) return dailySongs.value.slice(0, 8)
  return songStore.playList?.slice(0, 8) ?? []
})

const formatArtists = (song?: Song) => {
  if (!song || !song.ar || !song.ar.length) return '未知歌手'
  return song.ar.map((artist) => artist.name).join(' / ')
}

const formatDuration = (ms?: number) => {
  if (!ms) return '--:--'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatPlayCount = (count?: number) => {
  if (!count || count <= 0) return '0 播放'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1).replace(/\.0$/, '') + ' 亿播放'
  }
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, '') + ' 万播放'
  }
  return `${count} 播放`
}

const handlePlaySong = async (song: Song, index: number) => {
  try {
    const playList = songStore.playList || []
    const existingIndex = playList.findIndex((item) => Number(item.id) === Number(song.id))

    // 只把当前点击的推荐歌曲加入播放列表（如果还不存在）
    if (existingIndex === -1) {
      songStore.playList = [...playList, song]
      songStore.currentIndex = songStore.playList.length - 1
    } else {
      songStore.playList = playList
      songStore.currentIndex = existingIndex
    }

    await player(song.id, songStore.currentIndex)
    songStore.playStatus = true
  } catch (e) {
    console.error('播放推荐歌曲失败', e)
  }
}

onMounted(async () => {
  try {
    const [{ data: playlistsRes }, { data: songsRes }] = await Promise.all([
      RecommendAPI.getDailyPlaylists(),
      RecommendAPI.getDailySongs(),
    ])

    if (playlistsRes.value && Array.isArray((playlistsRes.value as any).recommend)) {
      recommendPlaylists.value = (playlistsRes.value as any).recommend
    }

    if (
      songsRes.value &&
      (songsRes.value as any).data &&
      Array.isArray((songsRes.value as any).data.dailySongs)
    ) {
      dailySongs.value = (songsRes.value as any).data.dailySongs
    }
  } catch (e) {
    console.error('获取每日推荐失败', e)
  }
})
</script>

<style scoped>
.home-hero {
  background: linear-gradient(145deg, rgba(56, 189, 248, 0.06), rgba(99, 102, 241, 0.08));
}

.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(12px);
}

.hero-card {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.primary-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-transform;
}

.ghost-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition;
}

.metric-card {
  @apply rounded-xl bg-white/5 border border-white/5 px-4 py-3;
}

.tag {
  @apply inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white;
}

.song-card {
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.song-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
}

.playlist-card .line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quick-card {
  @apply rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
}
</style>
