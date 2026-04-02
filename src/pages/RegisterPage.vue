<template>
  <q-page class="flex flex-center bg-grey-2">
    <form
      class="q-pa-xl bg-white"
      style="border-radius: 20px; box-shadow: 0 0 12px #00000022"
      @submit.prevent="register"
    >
      <div class="text-h4 text-weight-medium">Welcome</div>
      <div class="text-subtitle1 text-grey-7 q-mb-sm">to the Smart Home Manager</div>
      <div class="q-mb-lg text-grey text-caption">Register your Account here.</div>
      <q-input
        label="Username"
        v-model="username"
        autocomplete="username"
        filled
        class="q-mb-md"
        :disable="loading"
      />
      <q-input
        label="Name"
        v-model="name"
        autocomplete="name"
        filled
        class="q-mb-md"
        :disable="loading"
      />
      <q-input
        label="Surname"
        v-model="surname"
        autocomplete="surname"
        filled
        class="q-mb-xl"
        :disable="loading"
      />
      <q-input
        label="Password"
        v-model="password"
        type="password"
        autocomplete="password"
        class="q-mb-md"
        filled
        :disable="loading"
      />
      <q-input
        label="Repeat Password"
        v-model="repeatPassword"
        type="password"
        autocomplete="repeat password"
        filled
        :disable="loading"
      />
      <q-btn
        class="q-mt-md full-width bg-primary"
        color="white"
        label="Register"
        flat
        rounded
        type="submit"
        :loading="loading"
        :disable="
          !username || !password || loading || password !== repeatPassword || !name || !surname
        "
      />
      <q-btn
        label="Or Login Here"
        flat
        dense
        style="text-decoration: underline"
        no-caps
        class="q-mt-sm"
        to="/"
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
const name = ref('')
const surname = ref('')
const password = ref('')
const repeatPassword = ref('')
const userStore = useUserStore()
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

async function register() {
  loading.value = true
  const result = await userStore.register(username.value, password.value, name.value, surname.value)
  loading.value = false
  if (result === true) {
    $q.notify({
      type: 'positive',
      message: 'Registration successful',
    })
    router.push('/')
  } else {
    $q.notify({
      type: 'negative',
      message: result,
    })
  }
}
</script>
