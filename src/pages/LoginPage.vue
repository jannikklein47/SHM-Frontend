<template>
  <q-page class="flex flex-center bg-grey-2">
    <form
      class="q-pa-xl bg-white"
      style="border-radius: 20px; box-shadow: 0 0 12px #00000022"
      @submit.prevent="login"
    >
      <div class="text-h4 text-weight-medium">Welcome</div>
      <div class="text-subtitle1 text-grey-7 q-mb-sm">to the Smart Home Manager</div>
      <div class="q-mb-xl text-grey text-caption">Please log in with your credentials.</div>
      <q-input
        label="Username"
        v-model="username"
        autocomplete="username"
        filled
        class="q-mb-md"
        :disable="loading"
      />
      <q-input
        label="Password"
        v-model="password"
        type="password"
        autocomplete="password"
        filled
        :disable="loading"
      />
      <q-btn
        class="q-mt-md full-width bg-primary"
        color="white"
        label="Login"
        flat
        rounded
        type="submit"
        :loading="loading"
        :disable="!username || !password || loading"
      />
    </form>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const userStore = useUserStore()
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

async function login() {
  loading.value = true
  const result = await userStore.login(username.value, password.value)
  loading.value = false
  if (result === true) {
    router.push('/dashboard')
  } else {
    $q.notify({
      type: 'negative',
      message: result,
    })
  }
}
</script>
