<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <q-card-section class="text-center">
        <div class="text-h5">Smart Home Login</div>
        <div class="text-subtitle2">Select User or Create New</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="users.length > 0">
        <div class="text-weight-bold q-mb-sm">Select User:</div>
        <q-list bordered separator>
          <q-item clickable v-ripple v-for="user in users" :key="user.id" @click="selectUser(user)">
            <q-item-section avatar>
              <q-icon name="person" color="primary" />
            </q-item-section>
            <q-item-section>{{ user.name }} {{ user.surname }}</q-item-section>
            <q-item-section side>ID: {{ user.id }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-else class="text-center text-grey">
        No users found. Please create one.
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-weight-bold q-mb-sm">Create New User:</div>
        <q-form @submit.prevent="createUser" class="q-gutter-md">
          <q-input
            v-model="newUser.name"
            label="First Name"
            dense
            outlined
            :rules="[(val) => !!val || 'Required']"
          />
          <q-input
            v-model="newUser.surname"
            label="Last Name"
            dense
            outlined
            :rules="[(val) => !!val || 'Required']"
          />
          <q-btn
            type="submit"
            color="secondary"
            label="Create & Login"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios' // Adjust based on your setup
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'

const router = useRouter()
const userStore = useUserStore()

const users = ref([])
const loading = ref(false)
const newUser = ref({ name: '', surname: '' })

// Fetch users on load
const fetchUsers = async () => {
  try {
    const res = await api.get('/user')
    users.value = res.data
  } catch (err) {
    console.error('Error fetching users', err)
  }
}

const selectUser = (user) => {
  userStore.login(user)
  router.push('/dashboard')
}

const createUser = async () => {
  loading.value = true
  try {
    const res = await api.post('/user', newUser.value)
    // Backend returns the new user object
    selectUser(res.data)
  } catch (err) {
    console.error('Error creating user', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)
</script>
