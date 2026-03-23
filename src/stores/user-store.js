import { jwtDecode } from 'jwt-decode'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { auth } from 'src/boot/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSessionValid: (state) => state.expiresAt > Date.now(),
  },

  actions: {
    async login(email, password) {
      try {
        const result = await auth.post('/login', { username: email, password: password })

        if (result.status === 200) {
          //const { accessToken, refreshToken, refreshTokenExp } = result.data

          this.setTokens(result.data)

          return true
        } else {
          return result.status
        }
      } catch (error) {
        if (error.response?.data?.message) {
          return error.response.data.title + ' | ' + error.response.data.message
        } else return error.message
      }
    },
    async register(email, password) {
      try {
        const result = await auth.post('/login/register', {
          username: email,
          password: password,
        })

        if (result.status === 200) {
          return true
        } else {
          return result.status
        }
      } catch (error) {
        return error.response?.data || error.message
      }
    },

    setTokens(payload) {
      this.token = payload.accessToken
      this.user = jwtDecode(payload.accessToken) || null

      localStorage.setItem('auth_data', JSON.stringify(payload))
    },

    logout() {
      this.$reset()
      localStorage.removeItem('auth_data')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
