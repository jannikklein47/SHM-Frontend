<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Smart Home Manager </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-item-label header> Seiten </q-item-label>
      <EssentialLink
        title="Dashboard"
        caption="Overview on Households, Rooms and Devices"
        icon="home"
        link="/dashboard"
      />
      <EssentialLink
        title="Profile"
        caption="Your Information and Settings"
        icon="account_circle"
        link="/profile"
      />

      <q-item clickable @click="logout">
        <q-item-section avatar>
          <q-icon name="exit_to_app" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useUserStore } from 'src/stores/user-store'
import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(false)
const userStore = useUserStore()
const router = useRouter()

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const logout = () => {
  userStore.logout()
  router.push('/')
}
</script>
