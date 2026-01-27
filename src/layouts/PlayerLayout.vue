<template>
  <div class="layout-shell">
    <!-- 固定侧边栏 -->
    <aside class="layout-aside">
      <div class="aside-inner">
        <div class="logo">Music</div>
        <nav class="menu">
          <a class="menu-item active" href="/">首页</a>
          <a class="menu-item" href="/play">播放</a>
        </nav>
      </div>
    </aside>

    <!-- 固定顶部栏 -->
    <header class="layout-header">
      <div class="header-inner">
        <div class="header-left">
          <div class="title">今日音乐</div>
          <div class="search-box-wrapper" ref="searchBoxWrapperRef">
            <button class="back-button" @click="handleBack">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="search-box">
              <span class="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                  <path d="M20 20L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <input
                v-model.trim="headerKeyword"
                type="text"
                placeholder="搜索音乐 / 歌手 / 歌单 / 专辑"
                class="search-input"
                @keydown.enter="handleHeaderSearch"
                @keydown.esc="headerShowSuggest = false"
                @focus="headerShowSuggest = true"
              />
              <button
                v-if="headerKeyword"
                class="clear-button"
                @click="headerKeyword = ''"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div
              v-if="headerShowSuggest"
              :class="['header-suggest-panel', { 'header-suggest-panel-empty': !headerKeyword }]"
            >
              <div class="header-suggest-content">
                <!-- 未输入：历史 + 热搜 -->
                <template v-if="!headerKeyword">
                  <div v-if="headerHistory.length" class="header-history">
                    <div class="header-history-header">
                      <span class="header-history-title">历史搜索</span>
                      <button class="header-history-clear" @click="clearHeaderHistory">
                        清空
                      </button>
                    </div>
                    <div class="header-history-list">
                      <button
                        v-for="item in headerHistory"
                        :key="item"
                        class="header-history-item"
                        @click="applyHeaderSuggestion(item)"
                      >
                        {{ item }}
                      </button>
                    </div>
                  </div>

                  <div v-if="headerHotKeywords.length" class="header-hot-card">
                    <header class="header-hot-header">
                      <h3 class="header-hot-title">热搜榜</h3>
                      <button class="header-hot-play-btn" @click="onHeaderPlayHot">
                        <span class="icon">▶</span>
                        播放
                      </button>
                    </header>
                    <div class="header-hot-grid">
                      <div
                        v-for="(column, colIndex) in headerHotColumns"
                        :key="colIndex"
                        class="header-hot-column"
                      >
                        <button
                          v-for="item in column"
                          :key="item.index"
                          class="header-hot-item"
                          @click="applyHeaderSuggestion(item.keyword)"
                        >
                          <span
                            :class="[
                              'header-hot-index',
                              item.displayIndex <= 3 ? 'header-hot-index-top' : 'header-hot-index-normal',
                            ]"
                          >
                            {{ item.displayIndex }}
                          </span>
                          <span class="header-hot-name">
                            {{ item.keyword }}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 榜单区域：只在未输入时显示 -->
                  <div class="header-rank-section">
                    <RankBoardCard :title="'古风榜'" :songs="headerRankSongs" @play-all="onHeaderPlayRank" />
                    <RankBoardCard :title="'摇滚榜'" :songs="headerRankSongs" @play-all="onHeaderPlayRank" />
                    <RankBoardCard :title="'民谣榜'" :songs="headerRankSongs" @play-all="onHeaderPlayRank" />
                  </div>
                </template>

                <!-- 有输入：只展示搜索建议 -->
                <template v-else>
                  <div v-if="headerHasSuggestions" class="header-suggest-list">
                    <button
                      v-for="(item, index) in headerSuggestionKeywords"
                      :key="item.fullText"
                      :class="['header-suggest-item', { 'header-suggest-item-active': headerSuggestActiveIndex === index }]"
                      @click="applyHeaderSuggestion(item.fullText)"
                      @mouseenter="headerSuggestActiveIndex = index"
                    >
                      <span class="header-suggest-icon">🔍</span>
                      <span class="header-suggest-text">
                        <span class="header-suggest-keyword">{{ item.keyword }}</span>
                        <span v-if="item.extension" class="header-suggest-extension">{{ item.extension }}</span>
                      </span>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="actions">
            <button class="header-btn">设置</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 中部内容，独立滚动 -->
    <main class="layout-main custom-scrollbar">
      <router-view />
    </main>

    <!-- 中层：播放详情页，全屏覆盖在普通页面上，但在播放栏下面 -->
    <transition
      name="play-page"
      @enter="onPlayPageEnter"
      @after-leave="onPlayPageAfterLeave"
    >
      <div
        v-if="SongStore.songDetailsDisplay"
        class="play-page-wrapper"
      >
        <PlayPage />
      </div>
    </transition>

    <!-- 顶层：底部播放栏，永远在最上层 -->
    <div class="player-bar">
      <PlayerControlBar />
    </div>

    <!-- 播放列表弹层（叠在最上面） -->
    <transition name="playlist-pop">
      <PlayListPage v-if="SongStore.playListDisplay" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSongStore } from '@/stores/modules/song.ts'
import { SearchAPI } from '@/api'
import type { SearchSuggestResult, SearchHotItem } from '@/types/search'
import type { Song } from '@/types/player'
import PlayerControlBar from '@/components/PlayerControlBar/index.vue'
import PlayListPage from '@/views/PlayListPage/index.vue'
import PlayPage from '@/views/play-page/index.vue'
import RankBoardCard from '@/views/home/component/RankBoardCard.vue'

const SongStore = useSongStore()
const router = useRouter()

const headerKeyword = ref('')
const headerShowSuggest = ref(false)
const headerSuggestResult = ref<SearchSuggestResult>({})
const headerHistory = ref<string[]>([])
const headerHotKeywords = ref<SearchHotItem[]>([])
const headerSuggestActiveIndex = ref<number>(-1)
let headerSuggestTimer: number | undefined
const searchBoxWrapperRef = ref<HTMLElement | null>(null)

const HEADER_HISTORY_KEY = 'header_search_history'

const headerSuggestionKeywords = computed(() => {
  const keyword = headerKeyword.value.trim()
  if (!keyword) return []

  const suggestions: Array<{ keyword: string; extension: string; fullText: string }> = []
  const keywordLower = keyword.toLowerCase()

  // 处理 allMatch：提取扩展词
  const allMatch = headerSuggestResult.value.allMatch || []
  allMatch.forEach((item) => {
    const fullKeyword = item.keyword
    if (fullKeyword && fullKeyword.toLowerCase() !== keywordLower) {
      const fullKeywordLower = fullKeyword.toLowerCase()
      // 检查是否以关键词开头
      if (fullKeywordLower.startsWith(keywordLower)) {
        const extension = fullKeyword.slice(keyword.length).trim()
        suggestions.push({
          keyword,
          extension,
          fullText: extension ? `${keyword} ${extension}` : fullKeyword,
        })
      } else if (fullKeywordLower.includes(keywordLower)) {
        // 如果关键词在中间或结尾，直接显示完整文本
        suggestions.push({
          keyword,
          extension: fullKeyword.replace(new RegExp(keyword, 'i'), '').trim(),
          fullText: fullKeyword,
        })
      }
    }
  })

  // 处理歌曲名称：提取扩展词
  const songs = headerSuggestResult.value.songs || []
  songs.forEach((song) => {
    const songName = song.name
    if (songName) {
      const songNameLower = songName.toLowerCase()
      if (songNameLower.includes(keywordLower) && songNameLower !== keywordLower) {
        if (songNameLower.startsWith(keywordLower)) {
          const extension = songName.slice(keyword.length).trim()
          suggestions.push({
            keyword,
            extension,
            fullText: extension ? `${keyword} ${extension}` : songName,
          })
        } else {
          suggestions.push({
            keyword,
            extension: songName.replace(new RegExp(keyword, 'i'), '').trim(),
            fullText: songName,
          })
        }
      }
    }
  })

  // 去重并限制数量
  const unique = Array.from(
    new Map(suggestions.map((item) => [item.fullText, item])).values()
  ).slice(0, 8)

  return unique
})

const headerHasSuggestions = computed(() => headerSuggestionKeywords.value.length > 0)

const headerRankSongs = computed<Song[]>(() => SongStore.playList?.slice(0, 9) ?? [])

const headerHotColumns = computed(() => {
  const list = (headerHotKeywords.value || []).slice(0, 9)
  const colCount = 3
  const rowsPerCol = 3
  const cols: { index: number; displayIndex: number; keyword: string }[][] = Array.from(
    { length: colCount },
    () => [],
  )

  list.forEach((item, idx) => {
    const col = Math.floor(idx / rowsPerCol)
    if (col < colCount) {
      cols[col].push({
        index: idx,
        displayIndex: idx + 1,
        keyword: item.first,
      })
    }
  })

  return cols
})

const onHeaderPlayRank = (songs: Song[]) => {
  if (!songs?.length) return
  SongStore.playList = songs
  SongStore.currentSong = songs[0]
}

const onHeaderPlayHot = () => {
  if (!headerHotKeywords.value?.length) return
  const firstKeyword = headerHotKeywords.value[0].first
  applyHeaderSuggestion(firstKeyword)
}

const loadHeaderHistory = () => {
  try {
    const raw = localStorage.getItem(HEADER_HISTORY_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      headerHistory.value = parsed.slice(0, 10)
    }
  } catch (e) {
    console.error('加载搜索历史失败', e)
  }
}

const saveHeaderHistory = () => {
  try {
    localStorage.setItem(HEADER_HISTORY_KEY, JSON.stringify(headerHistory.value.slice(0, 10)))
  } catch (e) {
    console.error('保存搜索历史失败', e)
  }
}

const addHeaderHistory = (kw: string) => {
  const val = kw.trim()
  if (!val) return
  const list = headerHistory.value.filter((item) => item !== val)
  list.unshift(val)
  headerHistory.value = list.slice(0, 10)
  saveHeaderHistory()
}

const clearHeaderHistory = () => {
  headerHistory.value = []
  saveHeaderHistory()
}

const fetchHeaderHot = async () => {
  try {
    const { data } = await SearchAPI.hotList()
    headerHotKeywords.value = data.value?.result?.hots?.slice(0, 10) || []
  } catch (e) {
    console.error('获取热搜失败', e)
  }
}

const fetchHeaderSuggest = async (q: string) => {
  if (!q) {
    headerSuggestResult.value = {}
    return
  }
  try {
    const { data } = await SearchAPI.suggest(q,'mobile')
    headerSuggestResult.value = data.value?.result || {}
  } catch (e) {
    console.error('获取搜索建议失败', e)
  }
}

const applyHeaderSuggestion = (word: string) => {
  headerKeyword.value = word
  headerShowSuggest.value = false
  handleHeaderSearch()
}

const handleHeaderSearch = () => {
  const kw = headerKeyword.value.trim()
  if (!kw) return
  addHeaderHistory(kw)
  headerShowSuggest.value = false
  router.push({ name: 'search', query: { keyword: kw } })
}

const handleBack = () => {
  router.back()
}

watch(
  () => headerKeyword.value,
  (val) => {
    if (headerSuggestTimer) window.clearTimeout(headerSuggestTimer)
    headerSuggestActiveIndex.value = -1
    if (!val) {
      headerSuggestResult.value = {}
      return
    }
    headerSuggestTimer = window.setTimeout(() => fetchHeaderSuggest(val), 300)
  },
)

// 点击外部隐藏搜索建议面板
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (searchBoxWrapperRef.value && !searchBoxWrapperRef.value.contains(target)) {
    headerShowSuggest.value = false
  }
}

onMounted(() => {
  loadHeaderHistory()
  fetchHeaderHot()
  // 使用 mousedown 事件，在 focus 之前触发，避免冲突
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  // 移除全局点击事件监听
  document.removeEventListener('mousedown', handleClickOutside)
  // 恢复 body 滚动
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
})

// 保存滚动位置
let savedScrollY = 0

// 播放详情页进入时：禁用滚动
const onPlayPageEnter = () => {
  // 保存当前滚动位置
  savedScrollY = window.scrollY
  // 禁用 body 滚动
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.width = '100%'
}

// 播放详情页完全离开后：恢复滚动（在动画结束后执行）
const onPlayPageAfterLeave = () => {
  // 恢复 body 滚动
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  // 恢复滚动位置
  window.scrollTo(0, savedScrollY)
  savedScrollY = 0
}

</script>

<style scoped>
:global(:root) {
  --aside-width: 220px;
  --header-height: 64px;
  --control-bar-height: 80px;
}

.layout-shell {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #0b1221;
  color: #e5e7eb;
}


.layout-aside {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--aside-width);
  height: 100vh;
  padding: 20px 16px;
  background: linear-gradient(180deg, rgba(34, 40, 64, 0.95), rgba(22, 29, 48, 0.95));
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 3000;
  overflow-y: auto;
}

.aside-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.05em;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: block;
  padding: 10px 12px;
  border-radius: 12px;
  color: #cbd5e1;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.menu-item:hover,
.menu-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.layout-header {
  position: fixed;
  top: 0;
  left: var(--aside-width);
  right: 0;
  height: var(--header-height);
  padding: 0 24px;
  background: rgba(12, 18, 32, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(12, 18, 32, 0.9);
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(12, 18, 32, 1);
  color: #cbd5e1;
}

.actions {
  display: flex;
  gap: 10px;
}

.header-btn {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  flex: 1;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(148, 163, 184, 0.4);
}

.header-suggest-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: calc((100vw - var(--aside-width)) / 2);
  max-width: 600px;
  background: #020617;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.9);
  padding: 16px;
  z-index: 4000;
  max-height: calc(100vh - var(--header-height) - 100px);
  overflow-y: auto;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.header-suggest-panel::-webkit-scrollbar {
  width: 6px;
}

.header-suggest-panel::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.header-suggest-panel::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.header-suggest-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* 未输入时的面板样式（历史、热搜、榜单） */
.header-suggest-panel-empty {
  /* 继承父类样式，无需额外设置 */
}

.header-suggest-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 有输入时，只显示搜索建议列表，移除其他内容的样式 */
.header-suggest-content > .header-suggest-list:only-child {
  margin: 0;
}

.header-rank-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.9);
}

.header-rank-section :deep(.rank-card) {
  padding: 16px 18px 14px;
  margin-bottom: 0;
}

.header-rank-section :deep(.rank-card-title) {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.header-rank-section :deep(.rank-grid) {
  column-gap: 16px;
}

.header-rank-section :deep(.rank-item) {
  font-size: 13px;
}

.header-rank-section :deep(.rank-index-top) {
  color: #ef4444;
  font-weight: 600;
}

.header-rank-section :deep(.rank-index-normal) {
  color: #ffffff;
}

.header-rank-section :deep(.rank-name) {
  color: #ffffff;
}

.header-rank-section :deep(.rank-play-btn) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-rank-section :deep(.rank-play-btn:hover) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
  transform: translateY(-1px);
}

.header-history {
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.9);
  padding-bottom: 6px;
}

.header-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.header-history-title {
  font-size: 12px;
  color: #9ca3af;
}

.header-history-clear {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
}

.header-history-clear:hover {
  color: #9ca3af;
}

.header-history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.header-history-item {
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  font-size: 11px;
  cursor: pointer;
}

.header-history-item:hover {
  border-color: rgba(16, 185, 129, 0.6);
  color: #6ee7b7;
}

.header-hot-card {
  background: #020617;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 16px 18px 14px;
  margin-bottom: 12px;
}

.header-hot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.header-hot-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.header-hot-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-hot-play-btn .icon {
  font-size: 11px;
  opacity: 0.9;
}

.header-hot-play-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
  transform: translateY(-1px);
}

.header-hot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 16px;
}

.header-hot-column {
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.header-hot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 2px 0;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: opacity 0.2s ease;
}

.header-hot-item:hover {
  opacity: 0.8;
}

.header-hot-index {
  min-width: 20px;
  text-align: left;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  flex-shrink: 0;
}

.header-hot-index-top {
  color: #ef4444;
  font-weight: 600;
}

.header-hot-index-normal {
  color: #ffffff;
}

.header-hot-name {
  flex: 1;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-suggest-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
}

.header-suggest-list::-webkit-scrollbar {
  width: 6px;
}

.header-suggest-list::-webkit-scrollbar-track {
  background: transparent;
}

.header-suggest-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
}

.header-suggest-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

.header-suggest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background-color 0.2s ease;
}

.header-suggest-item:hover,
.header-suggest-item-active {
  background: #2a2a2a;
}

.header-suggest-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 14px;
  color: #9ca3af;
  flex-shrink: 0;
  opacity: 0.7;
}

.header-suggest-item:hover .header-suggest-icon,
.header-suggest-item-active .header-suggest-icon {
  color: #ffffff;
  opacity: 1;
}

.header-suggest-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-suggest-keyword {
  color: #ffffff;
  font-weight: 400;
}

.header-suggest-extension {
  color: #9ca3af;
}

.header-suggest-item:hover .header-suggest-extension,
.header-suggest-item-active .header-suggest-extension {
  color: #cbd5e1;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
  opacity: 0.8;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #ffffff;
  font-size: 14px;
  min-width: 0;
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6b1d5c;
  border: none;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.clear-button:hover {
  background: #7c1d6b;
  transform: scale(1.1);
}

.layout-main {
  position: fixed;

  top: var(--header-height);
  left: var(--aside-width);
  right: 0;
  bottom: var(--control-bar-height);
  padding: 20px 24px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.play-page-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9000;
}

.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--control-bar-height);
  background: #111827;
  z-index: 10000;
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

/* 播放详情页过渡动画 */
.play-page-enter-active,
.play-page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.play-page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.play-page-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-page-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
</style>
