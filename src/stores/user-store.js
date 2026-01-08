import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null, // Stores { id, vorname, nachname }
  }),
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
  },
  actions: {
    login(user) {
      this.currentUser = user
      // Optional: Save to localStorage for persistence
      localStorage.setItem('smart_user', JSON.stringify(user))
    },
    logout() {
      this.currentUser = null
      localStorage.removeItem('smart_user')
    },
    loadFromStorage() {
      const stored = localStorage.getItem('smart_user')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    },
  },
})
