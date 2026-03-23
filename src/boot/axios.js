import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useUserStore } from 'src/stores/user-store'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://localhost:3000/api/v1/app' })
const auth = axios.create({ baseURL: 'http://localhost:3000/api/v1/auth' })

export default defineBoot(({ app, store, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  const userStore = useUserStore(store)

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  api.interceptors.request.use((config) => {
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  })

  // Handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        userStore.logout()
        router.push('/')
      }

      return Promise.reject(error)
    },
  )

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  app.config.globalProperties.$auth = auth
})

export { api, auth }
