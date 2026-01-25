<template>
  <div class="search-page text-slate-100">
    <section
      ref="scrollContainerRef"
      class="glass-panel rounded-2xl border border-white/10
             p-4 sm:p-6
             h-full overflow-y-auto custom-scrollbar"
    >
      <!-- tabs -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.type"
          :class="['tab-btn', activeType === tab.type && 'active']"
          @click="changeType(tab.type)"
        >
          {{ tab.label }}
        </button>

        <span v-if="totalText" class="ml-auto text-xs text-slate-400">
          {{ totalText }}
        </span>
      </div>

      <!-- 状态 -->
      <div v-if="loading" class="py-12 text-center text-slate-400">
        正在搜索...
      </div>

      <div v-else-if="error" class="py-8 text-center text-rose-300">
        {{ error }}
      </div>

      <!-- 结果 -->
      <div v-else>
        <!-- 单曲 -->
        <SearchSongList
          v-if="activeType === 1"
          :songs="result.songs || []"
          @play="playSong"
        />

        <!-- 专辑 -->
        <div
          v-else-if="activeType === 10"
          class="grid sm:grid-cols-2 md:grid-cols-3 gap-3"
        >
          <div
            v-for="album in result.albums || []"
            :key="album.id"
            class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
          >
            <img
              :src="getCover(album.picUrl)"
              class="h-14 w-14 rounded-lg object-cover border border-white/10"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold truncate">{{ album.name }}</p>
              <p class="text-xs text-slate-400 truncate">
                {{ formatArtists(album.artists || []) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 歌手 -->
        <div
          v-else-if="activeType === 100"
          class="grid sm:grid-cols-3 md:grid-cols-4 gap-3"
        >
          <div
            v-for="artist in result.artists || []"
            :key="artist.id"
            class="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
          >
            <div
              class="h-20 w-20 mx-auto rounded-full
                     bg-indigo-500/30 grid place-items-center"
            >
              {{ artist.name?.slice(0, 2) }}
            </div>
            <p class="mt-2 text-sm truncate">{{ artist.name }}</p>
          </div>
        </div>

        <!-- 歌单 -->
        <div
          v-else-if="activeType === 1000"
          class="grid md:grid-cols-2 gap-3"
        >
          <div
            v-for="list in result.playlists || []"
            :key="list.id"
            class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
          >
            <img
              :src="getCover(list.coverImgUrl)"
              class="h-14 w-14 rounded-lg object-cover border border-white/10"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold truncate">{{ list.name }}</p>
              <p class="text-xs text-slate-400">
                曲目 {{ list.trackCount }}
              </p>
            </div>
          </div>
        </div>

        <!-- 用户 -->
        <div
          v-else-if="activeType === 1002"
          class="grid sm:grid-cols-2 md:grid-cols-3 gap-3"
        >
          <div
            v-for="user in result.userprofiles || []"
            :key="user.userId"
            class="rounded-xl bg-white/5 border border-white/10 p-3 flex gap-3"
          >
            <img
              :src="getCover(user.avatarUrl)"
              class="h-14 w-14 rounded-full object-cover border border-white/10"
            />
            <div class="min-w-0">
              <p class="text-sm truncate">{{ user.nickname }}</p>
              <p class="text-xs text-slate-400 truncate">
                {{ user.signature || '这个人很低调' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 懒加载 -->
        <div
          v-if="hasMore"
          ref="loadMoreRef"
          class="py-6 text-center text-slate-400 text-sm"
        >
          {{ loadingMore ? '加载中...' : '下滑加载更多' }}
        </div>

        <div v-else class="py-6 text-center text-slate-500 text-sm">
          没有更多了
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SearchAPI } from '@/api'
import { usePlayer } from '@/hooks/usePlayer'
import { useSongStore } from '@/stores/modules/song'
import SearchSongList from './components/SearchSongList.vue'

/* 基础状态 */
const route = useRoute()
const keyword = ref('')
const activeType = ref(1)
const result = ref<any>({})
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')

/* 分页 */
const limit = 30
const offset = ref(0)
const hasMore = ref(true)

/* tabs */
const tabs = [
  { label: '单曲', type: 1 },
  { label: '专辑', type: 10 },
  { label: '歌手', type: 100 },
  { label: '歌单', type: 1000 },
  { label: '用户', type: 1002 },
]

/* 播放 */
const { songDetail, player } = usePlayer()
const songStore = useSongStore()
const playSong = async (song: any) => {
  await songDetail(song.id)
  await player(song.id, songStore.currentIndex)
  songStore.playStatus = true
}

/* 搜索 */
const handleSearch = async (reset = true) => {
  if (!keyword.value) return

  if (reset) {
    loading.value = true
    offset.value = 0
    hasMore.value = true
  } else {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
  }

  try {
    const { data } = await SearchAPI.search({
      keywords: keyword.value,
      type: activeType.value,
      limit,
      offset: offset.value,
    })

    const res = data.value?.result || {}
    if (reset) result.value = res
    else mergeResult(res)

    const list = getCurrentList(res)
    if (!list || list.length < limit) hasMore.value = false
    offset.value += limit
  } catch {
    error.value = '搜索失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

/* 合并 */
const getCurrentList = (res: any) => {
  return {
    1: res.songs,
    10: res.albums,
    100: res.artists,
    1000: res.playlists,
    1002: res.userprofiles,
  }[activeType.value]
}

const mergeResult = (res: any) => {
  const keyMap: any = {
    1: 'songs',
    10: 'albums',
    100: 'artists',
    1000: 'playlists',
    1002: 'userprofiles',
  }
  const key = keyMap[activeType.value]
  result.value[key] = [...(result.value[key] || []), ...(res[key] || [])]
}

/* tab 切换 */
const changeType = (type: number) => {
  if (type === activeType.value) return
  activeType.value = type
  hasScrolled.value = false // 重置滚动标记
  handleSearch(true)
}

/* 懒加载 observer */
const scrollContainerRef = ref<HTMLElement | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let hasScrolled = ref(false) // 标记是否已经滚动过
let realScrollContainer: HTMLElement | null = null // 真正的滚动容器（.layout-main）

// 检查是否真的滚动到底部
const checkScrollBottom = () => {
  if (!loadMoreRef.value) return false

  // 使用真正的滚动容器（.layout-main）
  const container = realScrollContainer || document.querySelector('.layout-main') as HTMLElement
  if (!container) return false

  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // 检查是否接近底部（距离底部小于100px）
  return scrollHeight - scrollTop - clientHeight < 100
}

// 设置 observer
const setupObserver = () => {
  // 先断开旧的 observer
  if (observer) {
    observer.disconnect()
  }

  // 如果 loadMoreRef 不存在或没有更多数据，不设置 observer
  if (!loadMoreRef.value || !hasMore.value) {
    return
  }

  // 获取真正的滚动容器
  if (!realScrollContainer) {
    realScrollContainer = document.querySelector('.layout-main') as HTMLElement
  }

  // 检查初始状态：如果内容不足以产生滚动条，且 loadMoreRef 已经在视口内，不设置 observer
  if (!hasScrolled.value && realScrollContainer) {
    const scrollHeight = realScrollContainer.scrollHeight
    const clientHeight = realScrollContainer.clientHeight
    const hasScrollbar = scrollHeight > clientHeight

    // 如果没有滚动条，说明内容不够，不应该立即加载
    if (!hasScrollbar) {
      return
    }
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      // 只有在真正进入视口，且已经滚动过，且接近底部时才触发
      if (
        entry.isIntersecting &&
        hasMore.value &&
        !loadingMore.value &&
        hasScrolled.value &&
        checkScrollBottom()
      ) {
        handleSearch(false)
      }
    },
    {
      root: realScrollContainer, // 使用真正的滚动容器作为根
      rootMargin: '0px',
      threshold: 0.1, // 至少10%可见时才触发
    },
  )

  observer.observe(loadMoreRef.value)
}

// 监听滚动事件，标记已滚动（监听 window 的滚动，因为真正的滚动容器是 .layout-main）
const handleScroll = () => {
  if (!hasScrolled.value) {
    hasScrolled.value = true
  }
}

// 监听 loadMoreRef 的变化，确保元素渲染后再观察
watch(loadMoreRef, () => {
  if (loadMoreRef.value && !loading.value) {
    // 使用 nextTick 确保 DOM 更新完成
    nextTick(() => setupObserver())
  }
})

// 监听搜索完成，重新设置 observer
watch([loading, loadingMore], () => {
  if (!loading.value && !loadingMore.value && loadMoreRef.value) {
    // 重置滚动标记，因为新数据加载后需要重新判断
    hasScrolled.value = false
    nextTick(() => setupObserver())
  }
})

onMounted(() => {
  // 获取真正的滚动容器
  realScrollContainer = document.querySelector('.layout-main') as HTMLElement

  // 添加滚动监听（监听真正的滚动容器 .layout-main）
  if (realScrollContainer) {
    realScrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
  // 初始设置 observer
  nextTick(() => setupObserver())
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  // 移除滚动监听
  if (realScrollContainer) {
    realScrollContainer.removeEventListener('scroll', handleScroll)
  }
  realScrollContainer = null
})

/* 路由同步 */
watch(
  () => route.query,
  () => {
    keyword.value = (route.query.keyword as string) || ''
    activeType.value = Number(route.query.type) || 1
    hasScrolled.value = false // 重置滚动标记
    handleSearch(true)
  },
  { immediate: true },
)

/* utils */
const totalText = computed(() => {
  if (activeType.value === 1) return `${result.value.songCount || 0} 首单曲`
  if (activeType.value === 10) return `${result.value.albumCount || 0} 张专辑`
  return ''
})

const formatArtists = (arr: any[]) => arr.map(i => i.name).join(' / ')
const getCover = (url: string) => `${url}?param=100y100`
</script>
