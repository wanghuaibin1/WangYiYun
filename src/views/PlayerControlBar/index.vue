<template>
<div>
  <audio ref="audio" :src='SongStore.songUrl'></audio>
</div>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import { usePlayer } from '@/hooks/usePlayer.ts'

defineComponent({
  name: 'playerControlBar',
})
const SongStore = useSongStore()
const { player } = usePlayer()

const audio = ref<HTMLAudioElement>()


onMounted(async () => {
  await player(SongStore.playList[SongStore.currentIndex].id)
})
</script>

<style scoped></style>
