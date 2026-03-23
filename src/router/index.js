import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserStore } from 'src/stores/user-store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Navigation Guard
  Router.beforeEach((to, from, next) => {
    const userStore = useUserStore(store)
    const isAuthenticated = userStore.isAuthenticated

    // 1. If the route requires auth and user is NOT logged in -> Redirect to Login
    if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
      next('/')
    }

    // 2. If user IS logged in and tries to go to Login page -> Redirect to Home
    else if (to.matched.some((record) => record.meta.guestOnly) && isAuthenticated) {
      next('/dashboard')
    }

    // 3. Otherwise, let them through
    else {
      next()
    }
  })

  return Router
})
