<template>
  <!-- 收藏 -->
  <div class="thums-up mr-7" @click="throttledThumbsUp">
    <div class="heart" ref="heart">
      <svg
        :style="heartStyle"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        :width="props.wh"
        :height="props.wh"
      >
        <path
          d="M533.504 268.288q33.792-41.984 71.68-75.776 32.768-27.648 74.24-50.176t86.528-19.456q63.488 5.12 105.984 30.208t67.584 63.488 34.304 87.04 6.144 99.84-17.92 97.792-36.864 87.04-48.64 74.752-53.248 61.952q-40.96 41.984-85.504 78.336t-84.992 62.464-73.728 41.472-51.712 15.36q-20.48 1.024-52.224-14.336t-69.632-41.472-79.872-61.952-82.944-75.776q-26.624-25.6-57.344-59.392t-57.856-74.24-46.592-87.552-21.504-100.352 11.264-99.84 39.936-83.456 65.536-61.952 88.064-35.328q24.576-5.12 49.152-1.536t48.128 12.288 45.056 22.016 40.96 27.648q45.056 33.792 86.016 80.896z"
        ></path>
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, onBeforeMount,watch } from 'vue'
import mojs from '@mojs/core'
import { useSongStore, useUserStore } from '@/stores'
import { upCollectState } from '@/hooks/useUser'
import { SongAPI } from '@/api'
import { throttle } from 'lodash'
import { ElMessage } from 'element-plus'

// 状态管理
const SongStore = useSongStore()
const UserStore = useUserStore()
// 属性
const props = defineProps<{ id: number; wh: string }>()

// SVG 容器引用
const heart = ref<HTMLElement | null>(null)

// 动态样式
const heartBounce = ref(1)
const heartStyle = computed(() => ({
  fill: SongStore.hearted ? '#E05B5B' : '',
  stroke: SongStore.hearted ? '#E05B5B' : '',
  transform: `scale3d(${heartBounce.value}, ${heartBounce.value}, 1)`,
  // boxShadow: SongStore.hearted ? '0px 4px 10px rgba(224, 91, 91, 0.5)' : '',
}))

// 动画变量
let burst: mojs.Burst, aperture: mojs.Transit, bounce: mojs.Tween

// 初始化动画
const initAnimations = () => {
  burst = new mojs.Burst({
    radius: { 0: 50 },
    parent: heart.value,
    easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
    duration: 1500,
    delay: 300,
    children: {
      duration: 750,
      radius: { 0: 'rand(5,25)' },
      shape: ['circle', 'rect', 'polygon'],
      fill: [
        '#1abc9c',
        '#2ecc71',
        '#00cec9',
        '#3498db',
        '#9b59b6',
        '#fdcb6e',
        '#f1c40f',
        '#e67e22',
        '#e74c3c',
        '#e84393',
      ],
      degreeShift: 'rand(-90, 90)',
      delay: 'stagger(0, 40)',
    },
    opacity: 0.6,
    count: 10,
  })

  aperture = new mojs.Transit({
    parent: heart.value,
    duration: 750,
    type: 'circle',
    radius: { 0: 20 },
    fill: 'transparent',
    stroke: '#E05B5B',
    strokeWidth: { 20: 0 },
    opacity: 0.6,
    easing: mojs.easing.bezier(0, 1, 0.5, 1),
  })

  bounce = new mojs.Tween({
    duration: 1200,
    onUpdate: (progress) => {
      heartBounce.value = progress > 0.3 ? mojs.easing.elastic.out(1.43 * progress - 0.43) : 0
    },
  })
}

// 收藏逻辑
const addToFavorite = async () => {
  const { data: res } = await SongAPI.likeSong(SongStore.currentSong.id)
  if (res.value.code === 200) {
    await UserStore.getLikeSongList()
    SongStore.hearted = true
    ElMessage.success('已添加到我的喜欢')
  } else {
    ElMessage.error('收藏失败')
  }
}

const removeFromFavorite = async () => {
  const { data: res } = await SongAPI.likeSong(SongStore.currentSong.id, false)
  if (res.value.code === 200) {
    await UserStore.getLikeSongList()
    SongStore.hearted = false
    ElMessage.success('已取消喜欢')
  } else {
    ElMessage.error('取消收藏失败')
  }
}

// 收藏按钮点击逻辑
const thumbsUp = () => {
  if (!SongStore.hearted) {
    new mojs.Timeline().add(burst, aperture, bounce).play()
    addToFavorite()
  } else {
    removeFromFavorite()
  }
}
watch(
  () => SongStore.currentSong.id,
  () => {
    UserStore.getLikeSongList().then(() => {
      SongStore.hearted = upCollectState(SongStore.currentSong.id)
    })
  },
)
// 添加节流
const throttledThumbsUp = throttle(thumbsUp, 2000)

// 生命周期钩子
onBeforeMount(() => {
  UserStore.getLikeSongList().then(() => {
    SongStore.hearted = upCollectState(SongStore.currentSong.id)
  })
})

onMounted(() => {
  initAnimations()
})
</script>
<style scoped>
.thums-up {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 24px;
}

.thums-up .heart {
  display: inline-flex;
  position: relative;
  height: 25px;
  align-items: center;
}

.thums-up .heart svg {
  stroke: #d1d1d1;
  stroke-width: 60px;
  transition:
    fill 0.3s,
    stroke 0.3s;
  fill: transparent;
}

.thums-up:hover .heart svg {
  stroke: #e05b5b;
}
</style>
