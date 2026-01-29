<template>
  <div class="playlist-detail min-h-screen text-slate-100">
    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="mx-auto px-4 sm:px-8 lg:px-10 pb-20 pt-6">
      <!-- 顶部骨架 -->
      <section class="relative mb-10">
        <div class="left-6 sm:left-10 bottom-[-40px] sm:bottom-[-48px] flex items-end gap-6">
          <!-- 封面骨架 -->
          <div class="skeleton-cover h-32 w-32 sm:h-40 sm:w-40 rounded-2xl"></div>

          <!-- 信息骨架 -->
          <div class="pb-1 space-y-3 flex-1 min-w-0">
            <!-- 标题骨架 -->
            <div class="space-y-2">
              <div class="skeleton-text h-8 w-64 sm:w-80 rounded"></div>
              <div class="skeleton-text h-4 w-full max-w-md rounded"></div>
              <div class="skeleton-text h-4 w-3/4 max-w-sm rounded"></div>
            </div>

            <!-- 创建者骨架 -->
            <div class="flex items-center gap-2">
              <div class="skeleton-avatar h-6 w-6 rounded-full"></div>
              <div class="skeleton-text h-4 w-24 rounded"></div>
            </div>

            <!-- 统计信息骨架 -->
            <div class="flex items-center gap-4">
              <div class="skeleton-text h-4 w-20 rounded"></div>
              <div class="skeleton-text h-4 w-16 rounded"></div>
            </div>

            <!-- 按钮骨架 -->
            <div class="pt-2">
              <div class="skeleton-button h-10 w-28 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 歌曲列表骨架 -->
      <section class="mt-14">
        <div class="song-list">
          <div
            v-for="i in 10"
            :key="i"
            class="song-item skeleton-song-item"
          >
            <!-- 序号骨架 -->
            <div class="skeleton-text h-4 w-6 rounded flex-shrink-0"></div>

            <!-- 封面骨架 -->
            <div class="skeleton-cover h-12 w-12 rounded-lg flex-shrink-0"></div>

            <!-- 歌曲信息骨架 -->
            <div class="song-info flex-1 min-w-0">
              <div class="skeleton-text h-4 w-48 rounded mb-2"></div>
              <div class="skeleton-text h-3 w-32 rounded"></div>
            </div>

            <!-- 时长骨架 -->
            <div class="skeleton-text h-3 w-12 rounded flex-shrink-0"></div>
          </div>
        </div>
      </section>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="text-red-400">{{ error }}</div>
    </div>

    <!-- 歌单详情内容 -->
    <div v-else-if="playlistDetail" class="mx-auto px-4 sm:px-8 lg:px-10 pb-20 pt-6">
      <!-- 顶部：歌单封面和信息 -->
      <section class="relative mb-10">
        <div class="left-6 sm:left-10 bottom-[-40px] sm:bottom-[-48px] flex items-end gap-6">
          <!-- 歌单封面 -->
          <div class="relative">
            <img
              :src="playlistDetail.coverImgUrl"
              :alt="playlistDetail.name"
              class="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl object-cover shadow-2xl"
            />
          </div>

          <!-- 歌单信息 -->
          <div class="pb-1 space-y-3 flex-1 min-w-0">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
                {{ playlistDetail.name }}
              </h1>
              <p v-if="playlistDetail.description" class="text-sm text-slate-300/90 line-clamp-2">
                {{ playlistDetail.description }}
              </p>
            </div>

            <!-- 创建者信息 -->
            <div class="flex items-center gap-2 text-sm text-slate-300/90">
              <img
                v-if="playlistDetail.creator.avatarUrl"
                :src="playlistDetail.creator.avatarUrl"
                :alt="playlistDetail.creator.nickname"
                class="h-6 w-6 rounded-full"
              />
              <span>{{ playlistDetail.creator.nickname }}</span>
            </div>

            <!-- 统计信息 -->
            <div class="flex items-center gap-4 text-xs sm:text-sm text-slate-300/90">
              <span>播放 {{ formatPlayCount(playlistDetail.playCount) }}</span>
              <span>{{ playlistDetail.trackCount }} 首</span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-3 pt-2">
              <button
                class="play-all-btn"
                @click="handlePlayAll"
                :disabled="!songs.length"
              >
                <span class="icon">▶</span>
                播放全部
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 歌曲列表 -->
      <section class="mt-14">
        <div v-if="songs.length" class="song-list">
          <div
            v-for="(song, index) in songs"
            :key="song.id"
            class="song-item"
            @click="handlePlaySong(song, index)"
          >
            <!-- 序号 -->
            <div class="song-index">{{ index + 1 }}</div>

            <!-- 封面 -->
            <img
              :src="getCover(song)"
              :alt="song.name"
              class="song-cover"
            />

            <!-- 歌曲信息 -->
            <div class="song-info">
              <p class="song-name">
                <span>{{ song.name }}</span>
                <span
                  v-if="vipTag(song.fee)"
                  class="vip-tag"
                  :class="vipTag(song.fee)!.class"
                  :title="vipTag(song.fee)!.title"
                >
                  {{ vipTag(song.fee)!.text }}
                </span>
              </p>
              <p class="song-artist">{{ formatArtists(song.ar) }}</p>
            </div>

            <!-- 时长 -->
            <div class="song-duration">{{ formatDuration(song.dt) }}</div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="text-slate-400">暂无歌曲</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PlaylistAPI, SongAPI } from '@/api'
import { useUserStore, useSongStore } from '@/stores/index.ts'
import { usePlayer } from '@/hooks/usePlayer'
import { formatTime } from '@/utils/format'
import type { PlaylistDetail } from '@/api/modules/playlist'
import type { Song } from '@/types/player'

const route = useRoute()
const userStore = useUserStore()
const songStore = useSongStore()
const { songDetail, player } = usePlayer()

// 状态
const loading = ref(false)
const error = ref('')
const playlistDetail = ref<PlaylistDetail | null>(null)
const songs = ref<Song[]>([])

// 获取歌单 ID
const playlistId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : String(id)
})

// 获取封面 URL（从 query 或详情中）
const coverImgUrl = computed(() => {
  return (route.query.coverImgUrl as string) || playlistDetail.value?.coverImgUrl || ''
})

// 获取歌单详情
const fetchPlaylistDetail = async () => {
  if (!playlistId.value) {
    error.value = '歌单 ID 不存在'
    return
  }

  try {
    loading.value = true
    error.value = ''

    // 获取歌单详情
    const { data: detailRes } = await PlaylistAPI.getPlaylistDetail(playlistId.value)
    if (!detailRes.value?.playlist) {
      error.value = '获取歌单详情失败'
      return
    }

    playlistDetail.value = detailRes.value.playlist

    // 设置主题色
    if (coverImgUrl.value) {
      await userStore.setPlayThemeByCover(coverImgUrl.value)
    }

    // 获取所有歌曲
    await fetchPlaylistTracks()
  } catch (err: any) {
    console.error('获取歌单详情失败:', err)
    error.value = err.message || '获取歌单详情失败'
  } finally {
    loading.value = false
  }
}

// 获取歌单所有歌曲
const fetchPlaylistTracks = async () => {
  if (!playlistId.value || !playlistDetail.value) return

  try {
    // 获取歌单所有歌曲（通过 /playlist/track/all 接口）
    const { data: tracksRes } = await PlaylistAPI.getPlaylistTracks(playlistId.value)
    
    if (!tracksRes.value?.songs || tracksRes.value.songs.length === 0) {
      // 如果接口返回为空，尝试使用详情中的 tracks
      if (playlistDetail.value.tracks && playlistDetail.value.tracks.length > 0) {
        songs.value = playlistDetail.value.tracks
      } else {
        songs.value = []
      }
      return
    }

    // 检查 tracks 是否完整
    // 根据文档说明：返回的 trackIds 是完整的，tracks 则是不完整的
    const trackIds = playlistDetail.value.trackIds || []
    const tracksFromAPI = tracksRes.value.songs
    
    // 如果 trackIds 数量大于 tracks 数量，说明 tracks 不完整，需要用 trackIds 获取完整信息
    if (trackIds.length > 0 && trackIds.length > tracksFromAPI.length) {
      try {
        // 使用 trackIds 获取完整歌曲信息
        // 分批获取，每批最多 100 首（避免 URL 过长）
        const batchSize = 100
        const allSongs: Song[] = []
        
        for (let i = 0; i < trackIds.length; i += batchSize) {
          const batch = trackIds.slice(i, i + batchSize)
          const ids = batch.map(item => item.id).join(',')
          const { data: songDetailRes } = await SongAPI.getSongDetail(ids)
          
          if (songDetailRes.value?.songs) {
            allSongs.push(...songDetailRes.value.songs)
          }
        }
        
        if (allSongs.length > 0) {
          songs.value = allSongs
        } else {
          // 降级使用 tracks 数据
          songs.value = tracksFromAPI as any[]
        }
      } catch (err) {
        console.error('通过 trackIds 获取完整歌曲信息失败:', err)
        // 降级使用 tracks 数据
        songs.value = tracksFromAPI as any[]
      }
    } else {
      // tracks 数据完整，直接使用
      songs.value = tracksFromAPI as any[]
    }
  } catch (err: any) {
    console.error('获取歌单歌曲失败:', err)
    // 如果获取失败，尝试使用详情中的 tracks
    if (playlistDetail.value?.tracks && playlistDetail.value.tracks.length > 0) {
      songs.value = playlistDetail.value.tracks
    } else {
      songs.value = []
    }
  }
}

// 播放全部
const handlePlayAll = async () => {
  if (!songs.value.length) return

  try {
    // 设置播放列表
    songStore.playList = [...songs.value]
    songStore.currentIndex = 0
    
    // 播放第一首
    const firstSong = songs.value[0]
    await player(firstSong.id, 0)
    songStore.playStatus = true
  } catch (err) {
    console.error('播放失败:', err)
  }
}

// 播放单首歌曲
const handlePlaySong = async (song: Song, index: number) => {
  try {
    // 如果歌曲不在播放列表中，先添加
    const existingIndex = songStore.playList.findIndex(
      (item) => Number(item.id) === Number(song.id)
    )

    if (existingIndex === -1) {
      // 添加当前歌单的所有歌曲到播放列表
      songStore.playList = [...songs.value]
      songStore.currentIndex = index
    } else {
      songStore.currentIndex = existingIndex
    }

    // 播放歌曲
    await player(song.id, songStore.currentIndex)
    songStore.playStatus = true
  } catch (err) {
    console.error('播放失败:', err)
  }
}

// 工具函数
const getCover = (song: Song) => {
  const pic = song.al?.picUrl
  if (!pic) return '/default-cover.png'
  return `${pic}?param=100y100`
}

const formatArtists = (artists: { name: string }[] = []) =>
  artists.map((a) => a.name).join(' / ')

const formatDuration = (ms?: number) => (ms ? formatTime(ms) : '--:--')

const formatPlayCount = (count?: number) => {
  if (!count || count <= 0) return '0'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1).replace(/\.0$/, '') + '亿'
  }
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  }
  return String(count)
}

const vipTag = (fee?: number) => {
  if (fee === 1) {
    return {
      text: 'VIP',
      title: 'VIP 歌曲',
      class: 'vip-tag-vip',
    }
  }
  return null
}

// 监听路由变化
watch(
  () => route.params.id,
  () => {
    fetchPlaylistDetail()
  },
  { immediate: false }
)

onMounted(() => {
  fetchPlaylistDetail()
})
</script>

<style scoped>
.playlist-detail {
  min-height: 100vh;
}

.play-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 24px;
  background: #f97316;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-all-btn:hover:not(:disabled) {
  background: #ea580c;
  transform: translateY(-1px);
}

.play-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-all-btn .icon {
  font-size: 12px;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.song-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.8);
  flex-shrink: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.song-name > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-duration {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.8);
  width: 60px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.vip-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.vip-tag-vip {
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 骨架屏样式 */
.skeleton-cover,
.skeleton-text,
.skeleton-avatar,
.skeleton-button {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-cover {
  flex-shrink: 0;
}

.skeleton-text {
  height: 1em;
}

.skeleton-avatar {
  flex-shrink: 0;
}

.skeleton-button {
  height: 40px;
}

.skeleton-song-item {
  cursor: default;
  pointer-events: none;
}

.skeleton-song-item:hover {
  background: transparent;
}
</style>
