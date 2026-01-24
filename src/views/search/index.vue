<template>
  <div class="search-page text-slate-100">
    <section class="glass-panel rounded-2xl border border-white/10 p-4 sm:p-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.type"
            :class="['tab-btn', activeType === tab.type ? 'active' : '']"
            @click="changeType(tab.type)"
          >
            {{ tab.label }}
          </button>
          <span class="text-xs text-slate-400 ml-auto" v-if="totalText">{{ totalText }}</span>
        </div>

        <div v-if="loading" class="py-12 text-center text-slate-400">正在搜索...</div>
        <div v-else-if="error" class="py-8 text-center text-rose-300">{{ error }}</div>
        <div v-else>
          <SearchSongList
            v-if="activeType === 1"
            :songs="result.songs || []"
            @play="playSong"
          />

          <div v-else-if="activeType === 10" class="grid md:grid-cols-3 sm:grid-cols-2 gap-3">
            <div
              v-for="album in result.albums || []"
              :key="album.id"
              class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
            >
              <img :src="album.picUrl" alt="album" class="h-20 w-20 rounded-lg object-cover" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ album.name }}</p>
                <p class="text-xs text-slate-400 truncate">{{ formatArtists(album.artists || []) }}</p>
              </div>
            </div>
            <p v-if="!result.albums?.length" class="py-8 text-center text-slate-400 col-span-full">暂无结果</p>
          </div>

          <div v-else-if="activeType === 100" class="grid md:grid-cols-4 sm:grid-cols-3 gap-3">
            <div
              v-for="artist in result.artists || []"
              :key="artist.id"
              class="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center gap-2"
            >
              <div class="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/50 to-indigo-500/40 grid place-items-center text-white text-lg font-semibold">
                {{ artist.name?.slice(0, 2) || '歌手' }}
              </div>
              <p class="text-sm font-semibold text-white text-center truncate w-full">{{ artist.name }}</p>
            </div>
            <p v-if="!result.artists?.length" class="py-8 text-center text-slate-400 col-span-full">暂无结果</p>
          </div>

          <div v-else-if="activeType === 1000" class="grid md:grid-cols-2 gap-3">
            <div
              v-for="list in result.playlists || []"
              :key="list.id"
              class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
            >
              <img :src="list.coverImgUrl" alt="cover" class="h-20 w-20 rounded-lg object-cover" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ list.name }}</p>
                <p class="text-xs text-slate-400 truncate">曲目 {{ list.trackCount }}</p>
                <p class="text-xs text-slate-500 truncate">播放 {{ formatNumber(list.playCount) }}</p>
                <p class="text-xs text-slate-400 truncate" v-if="list.creator">by {{ list.creator.nickname }}</p>
              </div>
            </div>
            <p v-if="!result.playlists?.length" class="py-8 text-center text-slate-400 col-span-full">暂无结果</p>
          </div>

          <div v-else-if="activeType === 1002" class="grid md:grid-cols-3 sm:grid-cols-2 gap-3">
            <div
              v-for="user in result.userprofiles || []"
              :key="user.userId"
              class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
            >
              <img :src="user.avatarUrl" alt="avatar" class="h-14 w-14 rounded-full object-cover" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ user.nickname }}</p>
                <p class="text-xs text-slate-400 truncate">{{ user.signature || '这个人很低调' }}</p>
              </div>
            </div>
            <p v-if="!result.userprofiles?.length" class="py-8 text-center text-slate-400 col-span-full">暂无结果</p>
          </div>

          <div v-else class="py-8 text-center text-slate-400">该类型结果暂未适配</div>
        </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SearchAPI } from '@/api'
import type { Song } from '@/types/player'
import type { SearchResult } from '@/types/search'
import { usePlayer } from '@/hooks/usePlayer'
import { useSongStore } from '@/stores/modules/song'
import { formatNumber } from '@/utils/format'
import SearchSongList from './components/SearchSongList.vue'

interface TabItem {
  label: string
  type: number
}

const route = useRoute()

const keyword = ref('')
const activeType = ref<number>(1)
const result = ref<SearchResult>({})
const loading = ref(false)
const error = ref('')
const limit = ref(20)
const offset = ref(0)

const tabs: TabItem[] = [
  { label: '单曲', type: 1 },
  { label: '专辑', type: 10 },
  { label: '歌手', type: 100 },
  { label: '歌单', type: 1000 },
  { label: '用户', type: 1002 },
  { label: '视频', type: 1014 },
]

const { songDetail, player } = usePlayer()
const songStore = useSongStore()

const totalText = computed(() => {
  if (activeType.value === 1 && result.value.songCount) return `${result.value.songCount} 首单曲`
  if (activeType.value === 10 && result.value.albumCount) return `${result.value.albumCount} 张专辑`
  if (activeType.value === 100 && result.value.artistCount) return `${result.value.artistCount} 位歌手`
  if (activeType.value === 1000 && result.value.playlistCount) return `${result.value.playlistCount} 个歌单`
  if (activeType.value === 1002 && result.value.userprofileCount) return `${result.value.userprofileCount} 位用户`
  return ''
})

const formatArtists = (artists: { name: string }[] = []) => artists.map((a) => a.name).join(' / ')

const changeType = (type: number) => {
  if (activeType.value === type) return
  activeType.value = type
  handleSearch()
}

const handleSearch = async () => {
  const keywords = keyword.value
  if (!keywords) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await SearchAPI.search({
      keywords,
      type: activeType.value,
      limit: limit.value,
      offset: offset.value,
    })
    result.value = data.value?.result || {}
    if (!result.value || Object.keys(result.value).length === 0) {
      error.value = '暂无相关结果'
    }
  } catch (e) {
    error.value = '搜索失败，请稍后重试'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const playSong = async (song: Song) => {
  try {
    await songDetail(song.id)
    await player(song.id, songStore.currentIndex)
    songStore.playStatus = true
  } catch (e) {
    console.error('播放失败', e)
  }
}

const syncFromRoute = async (triggerSearch = true) => {
  const q = (route.query.keyword as string) || ''
  const t = Number(route.query.type)

  if (q) {
    keyword.value = q
  }
  if (!Number.isNaN(t) && t) {
    activeType.value = t
  }

  if (triggerSearch && q) {
    await handleSearch()
  }
}

onMounted(async () => {
  await syncFromRoute()
})

watch(
  () => [route.query.keyword, route.query.type],
  async ([newKw, newType], [oldKw, oldType]) => {
    if (newKw === oldKw && newType === oldType) return
    await syncFromRoute()
  },
)
</script>

<style scoped>
.glass-panel {
  background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.08), transparent 32%),
    radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.08), transparent 26%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(8px);
}

.primary-btn {
  background: linear-gradient(120deg, #10b981, #6366f1);
  color: #fff;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.type-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #e5e7eb;
  padding: 8px 30px 8px 12px;
  font-size: 13px;
  line-height: 1.2;
  position: relative;
  min-width: 112px;
  background-image: linear-gradient(45deg, transparent 50%, #cbd5e1 50%),
    linear-gradient(135deg, #cbd5e1 50%, transparent 50%);
  background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.type-select:focus {
  outline: none;
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.type-select option {
  background: #0f172a;
  color: #e2e8f0;
}

.chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  font-size: 12px;
  transition: all 0.12s ease;
}

.chip:hover {
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.tag {
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
  font-size: 12px;
}

.tab-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 13px;
  transition: all 0.12s ease;
}

.tab-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: linear-gradient(120deg, rgba(16, 185, 129, 0.14), rgba(99, 102, 241, 0.12));
  color: #fff;
  border-color: rgba(255, 255, 255, 0.18);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
}

.search-page {
  min-height: 100%;
}
</style>
