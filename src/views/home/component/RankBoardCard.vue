<template>
  <section class="rank-card">
    <!-- 标题区 -->
    <header class="rank-card-header">
      <h3 class="rank-card-title">
        {{ title }}
      </h3>
      <button class="rank-play-btn" @click="$emit('play-all', songs)">
        <span class="icon">▶</span>
        播放
      </button>
    </header>

    <!-- 内容区：三列 · 每列 3 首 -->
    <div class="rank-grid">
      <div
        v-for="(column, colIndex) in columns"
        :key="colIndex"
        class="rank-column"
      >
        <div
          v-for="item in column"
          :key="item.index"
          class="rank-item"
        >
          <span
            :class="[
              'rank-index',
              item.displayIndex <= 3 ? 'rank-index-top' : 'rank-index-normal',
            ]"
          >
            {{ item.displayIndex }}
          </span>
          <span class="rank-name">
            {{ item.song.name }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Song } from '@/types/player'

interface Props {
  title: string
  songs: Song[]
}

const props = defineProps<Props>()

const columns = computed(() => {
  const list = (props.songs || []).slice(0, 9)
  const colCount = 3
  const rowsPerCol = 3
  const cols: { index: number; displayIndex: number; song: Song }[][] = Array.from(
    { length: colCount },
    () => [],
  )

  list.forEach((song, idx) => {
    const col = Math.floor(idx / rowsPerCol)
    if (col < colCount) {
      cols[col].push({
        index: idx,
        displayIndex: idx + 1,
        song,
      })
    }
  })

  return cols
})
</script>

<style scoped>
.rank-card {
  background: #020617;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 16px 18px 14px;
}

.rank-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.rank-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.rank-play-btn {
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

.rank-play-btn .icon {
  font-size: 11px;
  opacity: 0.9;
}

.rank-play-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
  transform: translateY(-1px);
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 16px;
}

.rank-column {
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 2px 0;
}

.rank-index {
  min-width: 20px;
  text-align: left;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  flex-shrink: 0;
}

.rank-index-top {
  color: #ef4444;
  font-weight: 600;
}

.rank-index-normal {
  color: #ffffff;
}

.rank-name {
  flex: 1;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>




