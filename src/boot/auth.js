import { boot } from 'quasar/wrappers'
import { useUserStore } from 'src/stores/user-store'

export default boot(async ({ store }) => {
  // Use the store instance to access Pinia
  const userStore = useUserStore(store)

  // 1. Check if there is auth data in LocalStorage
  const savedAuth = localStorage.getItem('auth_data')

  if (savedAuth) {
    try {
      const authData = JSON.parse(savedAuth)

      userStore.setTokens(authData)
    } catch (e) {
      console.error('Failed to parse auth data from storage', e)
      userStore.logout()
    }
  }
})
