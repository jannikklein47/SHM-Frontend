import { defineBoot } from '#q-app/wrappers'
import { useUserStore } from 'src/stores/user-store'

export default defineBoot(({ store }) => {
  const userStore = useUserStore(store)

  userStore.loadFromStorage()
})
