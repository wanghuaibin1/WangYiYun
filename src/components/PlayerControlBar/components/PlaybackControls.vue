<template>
  <div class="flex mb-1 items-center">
    <Collect wh="20"/>
    <div class="cursor-pointer flex justify-center items-center">
      <button style="all: unset" circle @click="SongStore.prevSong(player)" title="上一首">
        <svg
          t="1729339634291"
          class="icon cursor-pointer"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="5250"
          width="16"
          height="16"
        >
          <path
            d="M206 865h-38c-30.928 0-56-25.072-56-56V216c0-30.928 25.072-56 56-56h38c30.928 0 56 25.072 56 56v593c0 30.928-25.072 56-56 56z m168.686-386.191l422.304-303.4c32.294-23.201 77.282-15.83 100.484 16.464A72 72 0 0 1 911 233.883v559.053c0 39.764-32.235 72-72 72a72 72 0 0 1-39.95-12.1L376.288 570.877c-25.73-17.16-32.677-51.93-15.517-77.66a56 56 0 0 1 13.915-14.408z"
            fill="#597EF7"
            p-id="5251"
          ></path>
        </svg>
      </button>
    </div>
    <!--        播放按钮-->
    <div class="mx-6 cursor-pointer" @click="SongStore.playStatus = !SongStore.playStatus">
      <svg
        v-if="SongStore.playStatus"
        t="1729339673574"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="6298"
        width="32"
        height="32"
      >
        <path
          d="M512 1024C229.229714 1024 0 794.770286 0 512S229.229714 0 512 0s512 229.229714 512 512-229.229714 512-512 512zM402.285714 329.142857a36.571429 36.571429 0 0 0-36.571428 36.571429v292.571428a36.571429 36.571429 0 0 0 73.142857 0v-292.571428a36.571429 36.571429 0 0 0-36.571429-36.571429z m219.428572 0a36.571429 36.571429 0 0 0-36.571429 36.571429v292.571428a36.571429 36.571429 0 0 0 73.142857 0v-292.571428a36.571429 36.571429 0 0 0-36.571428-36.571429z"
          fill="#d81e06"
          p-id="6299"
        ></path>
      </svg>
      <svg
        v-else
        t="1729339729615"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2709"
        width="32"
        height="32"
      >
        <path
          d="M512 0c282.7648 0 512 229.2224 512 512 0 282.7648-229.2352 512-512 512S0 794.7648 0 512C0 229.2224 229.2352 0 512 0z"
          fill="#d81e06"
          p-id="2710"
          data-spm-anchor-id="a313x.search_index.0.i1.283d3a81O6mZVg"
          class=""
        ></path>
        <path
          d="M691.6736 490.8288L409.3568 310.7968c-16.5376-10.0096-38.1568 2.496-38.1568 21.248v360.064c0 18.752 21.6192 31.2576 38.1568 21.248l281.0496-180.032c17.8048-8.7424 17.8048-33.7536 1.2672-42.496z"
          fill="#FFFFFF"
          p-id="2711"
          data-spm-anchor-id="a313x.search_index.0.i2.283d3a81O6mZVg"
          class="selected"
        ></path>
      </svg>
    </div>
    <div class="cursor-pointer flex justify-center items-center">
      <button style="all: unset" circle @click="SongStore.nextSong(player)" title="上一首">
        <svg
          t="1729339556510"
          class="icon cursor-pointer"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4274"
          width="16"
          height="16"
        >
          <path
            d="M817 160h38c30.928 0 56 25.072 56 56v593c0 30.928-25.072 56-56 56h-38c-30.928 0-56-25.072-56-56V216c0-30.928 25.072-56 56-56zM648.314 546.191l-422.304 303.4c-32.294 23.201-77.282 15.83-100.484-16.464A72 72 0 0 1 112 791.117V232.064c0-39.764 32.235-72 72-72a72 72 0 0 1 39.95 12.1l422.762 281.959c25.73 17.16 32.677 51.93 15.517 77.66a56 56 0 0 1-13.915 14.408z"
            fill="#597EF7"
            p-id="4275"
          ></path>
        </svg>
      </button>
    </div>
    <div class="ml-6 cursor-pointer flex justify-center items-center">
      <button
        style="all: unset"
        circle
        @click="SongStore.changePlayMode()"
        :title="SongStore.playMode.label"
      >
        <div v-html="SongStore.playModeIcon"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose } from 'vue'
import { useSongStore } from '@/stores/modules/song.ts'
import { usePlayer } from '@/hooks/usePlayer.ts'
import Collect from '@/components/PlayerControlBar/components/Collect.vue'

const SongStore = useSongStore()
const { player } = usePlayer()

defineExpose({})
</script>

<style scoped></style>
