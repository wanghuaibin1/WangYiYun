<template>
  <div class="min-h-screen text-slate-100">
    <div class="mx-auto px-4 sm:px-8 lg:px-10 pb-20 pt-6">
      <!-- 顶部背景 + 资料 -->
      <section class="relative mb-10">
        <div class="left-6 sm:left-10 bottom-[-40px] sm:bottom-[-48px] flex items-end gap-6">
          <div class="relative">
            <img
              :src="avatarUrl"
              alt="avatar"
              class="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-2xl"
            />
          </div>
          <div class="pb-1 space-y-2">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-bold text-white">
                {{ nickname }}
              </h1>
              <div
                v-if="userLevelText"
                class="inline-flex items-center gap-2 text-xs text-amber-200"
              >
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60"
                >
                  Lv. {{ userLevelText }}
                </span>
              </div>
            </div>
            <!-- 关注 + 粉丝 -->
            <p class="text-xs sm:text-sm text-slate-300/90">
              关注 {{ followCount }} · 粉丝 {{ fanCount }}
            </p>
            <p class="mt-1 text-xs sm:text-sm text-slate-200/90 max-w-xl">
              {{ introText }}
            </p>
          </div>
        </div>
      </section>

      <!-- 资料下方：统计 + 操作 + tab -->
      <section class="mt-14 flex flex-col gap-4">
        <div class="flex items-center gap-6 border-b border-white/5 text-sm mt-1">
          <button class="tab-item tab-item--active" type="button">歌单</button>
          <button class="tab-item" type="button" disabled>动态</button>
          <button class="tab-item" type="button" disabled>播客</button>
        </div>
      </section>

      <!-- 我创建的歌单 -->
      <section class="mt-6 space-y-4">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="section-title">我创建的歌单</h2>
          <span class="section-subtitle">{{ createdPlaylists.length }} 个歌单</span>
        </div>
        <div v-if="createdPlaylists.length" class="playlist-grid">
          <ProfilePlaylistCard v-for="item in createdPlaylists" :key="item.id" :item="item">
            <template #meta="{ item }"> 播放 {{ formatPlayCount(item.playCount) }} </template>
          </ProfilePlaylistCard>
        </div>
        <p v-else class="empty-text">暂无创建的歌单</p>
      </section>

      <!-- 我收藏的歌单 -->
      <section class="mt-10 space-y-4">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="section-title">我收藏的歌单</h2>
          <span class="section-subtitle">{{ collectedPlaylists.length }} 个歌单</span>
        </div>
        <div v-if="collectedPlaylists.length" class="playlist-grid">
          <ProfilePlaylistCard v-for="item in collectedPlaylists" :key="item.id" :item="item">
            <template #meta="{ item }"> 播放 {{ formatPlayCount(item.playCount) }} </template>
          </ProfilePlaylistCard>
        </div>
        <p v-else class="empty-text">暂无收藏的歌单</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index.ts'
import ProfilePlaylistCard from '@/components/ProfilePlaylistCard.vue'

const userStore = useUserStore()

const refreshing = ref(false)

const nickname = computed(() => userStore.UserInfo?.profile?.nickname || '未登录用户')
const avatarUrl = computed(() => userStore.UserInfo?.profile?.avatarUrl || '/favicon.ico')
const userLevelText = computed(() => userStore.UserInfo.level || '')

// 关注和粉丝数
const followCount = computed(() => userStore.UserInfo?.profile?.follows ?? 0)
const fanCount = computed(() => userStore.UserInfo?.profile?.followeds ?? 0)

// 个性签名，兼容未登录或字段缺失
const introText = computed(() => {
  const signature = userStore.UserInfo?.profile?.signature
  if (!signature) {
    return '这个人很懒，什么都没有写~'
  }
  return signature
})

// 用户歌单拆分：创建的 / 收藏的
const createdPlaylists = computed<any[]>(() => {
  const list = (userStore as any).userPlaylists || []
  const uid = userStore.userId
  if (!Array.isArray(list)) return []
  return list.filter((item: any) => item?.creator?.userId === uid)
})

const collectedPlaylists = computed<any[]>(() => {
  const list = (userStore as any).userPlaylists || []
  const uid = userStore.userId
  if (!Array.isArray(list)) return []
  return list.filter((item: any) => item?.creator?.userId !== uid)
})

// 播放量格式化（1.2万 / 3.4亿）
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

const refreshUserStats = async () => {
  if (!userStore.isLoggedIn) return
  try {
    refreshing.value = true
    await Promise.all([userStore.getUserSubcount(), userStore.getUserLevel()])
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  userStore.setUserThemeByCover(userStore.UserInfo.profile.avatarUrl)
  if (!userStore.isLoggedIn) return

  // 页面进入时补齐统计信息和歌单
  if (
    !userStore.userData ||
    (Array.isArray(userStore.userData) && userStore.userData.length === 0)
  ) {
    refreshUserStats()
  }
  if (!(userStore as any).userPlaylists || (userStore as any).userPlaylists.length === 0) {
    userStore.getUserPlaylists()
  }
})
</script>

<style scoped>
.profile-banner {
  background: linear-gradient(180deg, #3b1f1b 0%, #20101b 45%, #050816 100%);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #f9fafb;
}

.section-subtitle {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
}

.tab-item {
  position: relative;
  padding-bottom: 8px;
  color: rgba(148, 163, 184, 0.9);
  cursor: default;
}

.tab-item--active {
  color: #f9fafb;
}

.tab-item--active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 32px;
  height: 2px;
  border-radius: 999px;
  background: #f97316;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.empty-text {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.9);
}
</style>
