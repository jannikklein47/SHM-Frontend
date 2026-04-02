<template>
  <q-layout view="hHh Lpr lFf">
    <q-header
      style="
        background-color: #ffffffdd;
        backdrop-filter: blur(10px);
        filter: saturate(3);
        box-shadow: 0 0 12px #00000022;
      "
      v-if="$route.name !== 'login' && $route.name !== 'register'"
    >
      <q-toolbar class="text-black q-py-md q-px-lg">
        <q-toolbar-title style="flex-direction: row; display: flex">
          <span class="text-weight-bolder q-mr-md">Smart-Home-Manager</span>
          <span class="text-grey-8">{{ $route.name }}</span>
          <q-separator vertical class="q-mx-md" />
          <q-btn
            label="Dashboard"
            flat
            dense
            no-caps
            to="/dashboard"
            color="grey-7"
            class="text-weight-light"
            v-if="$route.name !== 'Dashboard'"
          />
          <q-btn
            label="Profile"
            flat
            dense
            no-caps
            to="/profile"
            class="text-weight-light"
            color="grey-7"
            v-if="$route.name !== 'Profile'"
          />
          <q-space />
          <q-btn label="Logout" flat dense no-caps @click="logout" />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useUserStore } from 'src/stores/user-store'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()

const logout = () => {
  userStore.logout()
  router.push('/')
}
</script>
