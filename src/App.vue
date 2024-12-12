<template>
  <error-boundary>
    <router-view></router-view>
  </error-boundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/components/base/ErrorBoundary.vue'
</script>
