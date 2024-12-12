import { defineStore } from 'pinia'
import { storage, STORAGE_KEY } from '@/utils/storage'


export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    cookie: storage.get(STORAGE_KEY.COOKIE) || null
  }),

  getters: {

  },

  actions: {

  }
})
