<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-xl">
      <div class="text-h4">My Households</div>
      <q-btn color="primary" icon="add" label="New House" no-caps @click="showAddHouse = true" />
    </div>

    <div v-if="loading" class="flex flex-center">
      <q-spinner size="3em" color="primary" />
    </div>

    <div v-else class="q-gutter-y-md">
      <q-banner v-if="households.length === 0" class="bg-warning text-white rounded-borders">
        You don't manage any households yet. Create one!
      </q-banner>

      <q-expansion-item
        v-for="house in households"
        :key="house.id"
        class="overflow-hidden"
        style="border-radius: 8px"
        icon="home"
        :label="house.name"
        :caption="house.adresse"
        header-class="bg-grey-2"
        default-opened
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="home" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ house.name }}</q-item-label>
            <q-item-label caption>{{ house.adresse }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn flat round color="orange" icon="edit" @click.stop="openEditHouse(house)">
                <q-tooltip>Rename Household</q-tooltip>
              </q-btn>

              <q-btn flat round color="grey-7" icon="group" @click.stop="openMemberList(house)">
                <q-tooltip>View Access/Permissions</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                color="primary"
                icon="person_add"
                @click.stop="openInviteDialog(house.id)"
              >
                <q-tooltip>Invite User</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </template>
        <q-card class="bg-grey-1">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6">Rooms</div>
              <q-btn
                flat
                dense
                color="secondary"
                icon="add"
                no-caps
                label="Add Room"
                @click="openAddRoom(house.id)"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div v-for="room in house.rooms" :key="room.id" class="col-12 col-md-6 col-lg-4">
                <q-card bordered class="my-card" flat>
                  <q-card-section class="bg-primary text-white q-py-sm">
                    <div class="text-subtitle1">{{ room.name }}</div>
                  </q-card-section>

                  <q-card-section>
                    <div v-if="room.devices.length === 0" class="text-grey text-caption">
                      No devices
                    </div>

                    <q-list dense>
                      <q-item
                        v-for="device in room.devices"
                        :key="device.id"
                        clickable
                        @click="goToDevice(device.id)"
                        class="rounded-borders q-my-xs bg-grey-1"
                      >
                        <q-item-section avatar>
                          <q-icon name="sensors" color="accent" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ device.name }}</q-item-label>
                          <q-item-label caption>{{ device.schnittstelle }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="chevron_right" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions align="right">
                    <q-btn
                      flat
                      size="sm"
                      color="grey"
                      label="+ Device"
                      @click="openAddDevice(room.id)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>

    <q-dialog v-model="showAddHouse">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">New Household</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="newHouseData.name" label="House Name" outlined dense />
          <q-input v-model="newHouseData.adresse" label="Address" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="createHouse" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditHouseDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Rename Household</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="editHouseData.name"
            label="New Name"
            outlined
            dense
            autofocus
            @keyup.enter="updateHouse"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="orange" label="Save Changes" @click="updateHouse" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddRoom">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">New Room</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="newRoomData.name" label="Room Name" outlined dense />
          <q-select
            v-model="newRoomData.raum_typ_id"
            :options="roomTypes"
            option-value="id"
            option-label="name"
            label="Room Type"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="createRoom" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddDevice">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Device</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newDeviceData.name"
            label="Device Name (e.g., Living Room AC)"
            outlined
            dense
          />

          <q-select
            v-model="newDeviceData.geraet_typ_id"
            :options="deviceTypes"
            option-value="id"
            option-label="name"
            label="Device Type"
            outlined
            dense
            emit-value
            map-options
          />

          <q-input
            v-model="newDeviceData.schnittstelle"
            label="Interface (e.g., Zigbee, WiFi, MQTT)"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="orange"
            label="Add Device"
            @click="createDevice"
            :disable="!newDeviceData.name || !newDeviceData.geraet_typ_id"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showInviteDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Invite User to Household</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <p class="text-caption text-grey-8">
            Select a user to grant them access to this household. They will be added as a member
            (non-administrator).
          </p>

          <q-select
            v-model="selectedUserToInvite"
            :options="allUsers"
            option-value="id"
            :option-label="(opt) => `${opt.vorname} ${opt.nachname} (ID: ${opt.id})`"
            label="Search User"
            outlined
            dense
            emit-value
            map-options
            use-input
            input-debounce="0"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No users found</q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Invite"
            @click="sendInvite"
            :disable="!selectedUserToInvite"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showMemberList">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Members: {{ currentViewingHouseName }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="member in householdMembers" :key="member.id">
              <q-item-section avatar>
                <q-avatar color="grey-3" text-color="primary" icon="person" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ member.vorname }} {{ member.nachname }}</q-item-label>
                <q-item-label caption>Permission Level</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge
                  :color="member.verwaltet ? 'negative' : 'blue'"
                  :label="member.verwaltet ? 'Admin' : 'Member'"
                />
              </q-item-section>
            </q-item>

            <q-item v-if="householdMembers.length === 0">
              <q-item-section class="text-grey italic">No access data found.</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const router = useRouter()
const userStore = useUserStore()
const households = ref([])
const roomTypes = ref([])
const loading = ref(true)

// Dialog Controls
const showAddHouse = ref(false)
const newHouseData = ref({ name: '', adresse: '' })

const showEditHouseDialog = ref(false)
const editHouseData = ref({ id: null, name: '' })

const showAddRoom = ref(false)
const targetHouseId = ref(null)
const newRoomData = ref({ name: '', raum_typ_id: null })

// Main Data Fetch
const fetchDashboardData = async () => {
  if (!userStore.currentUser) return router.push('/')
  loading.value = true

  try {
    // 1. Get Households
    const hRes = await api.get(`/haushalt/${userStore.currentUser.id}`)
    const rawHouses = hRes.data

    // 2. Hydrate each house with Rooms and Devices
    // Note: Doing this in a loop for simplicity, but Promise.all is better for performance
    const hydratedHouses = await Promise.all(
      rawHouses.map(async (house) => {
        const houseId = house.haushalt_id || house.id // Handle join result variance

        // Get Rooms
        const rRes = await api.get(`/raum/${houseId}`)
        const rooms = rRes.data

        // Get Devices (API returns all devices for a house)
        const dRes = await api.get(`/geraet/${houseId}`)
        const allDevices = dRes.data

        console.log(allDevices)

        // Map devices into rooms locally
        const roomsWithDevices = rooms.map((room) => {
          return {
            ...room,
            devices: allDevices.filter((d) => d.raum_id === room.id),
          }
        })

        return { ...house, id: houseId, rooms: roomsWithDevices }
      }),
    )

    households.value = hydratedHouses
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Actions
const createHouse = async () => {
  try {
    await api.post('/haushalt', {
      nutzerId: userStore.currentUser.id,
      ...newHouseData.value,
    })
    showAddHouse.value = false
    newHouseData.value = { name: '', adresse: '' }
    fetchDashboardData() // Refresh
  } catch (err) {
    console.error(err)
  }
}

const openEditHouse = (house) => {
  editHouseData.value = { id: house.id, name: house.name }
  showEditHouseDialog.value = true
}

const updateHouse = async () => {
  console.log('Updating house:', editHouseData.value)
  if (!editHouseData.value.name) return
  try {
    await api.patch(`/haushalt/${editHouseData.value.id}`, { name: editHouseData.value.name })
    showEditHouseDialog.value = false
    $q.notify({ color: 'positive', message: 'Haushalt umbenannt', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openAddRoom = (houseId) => {
  targetHouseId.value = houseId
  showAddRoom.value = true
}

const createRoom = async () => {
  try {
    await api.post(`/raum/${targetHouseId.value}`, newRoomData.value)
    showAddRoom.value = false
    newRoomData.value = { name: '', raum_typ_id: null }
    fetchDashboardData() // Refresh
  } catch (err) {
    console.error(err)
  }
}

const goToDevice = (deviceId) => {
  router.push(`/device/${deviceId}`)
}

// --- New State for Device Creation ---
const showAddDevice = ref(false)
const targetRoomId = ref(null)
const deviceTypes = ref([]) // To be filled from /typen
const newDeviceData = ref({
  name: '',
  geraet_typ_id: null,
  schnittstelle: '',
})

// Update fetchTypes to include device types
const fetchTypes = async () => {
  const res = await api.get('/typen')
  roomTypes.value = res.data.raum_typ
  deviceTypes.value = res.data.geraet_typ // Store device types
}

// --- New Action: Open Dialog ---
const openAddDevice = (roomId) => {
  targetRoomId.value = roomId
  showAddDevice.value = true
}

// --- New Action: API Call ---
const createDevice = async () => {
  try {
    // Matches your route: app.post("/geraet/:raum_id", ...)
    await api.post(`/geraet/${targetRoomId.value}`, {
      name: newDeviceData.value.name,
      geraet_typ_id: newDeviceData.value.geraet_typ_id,
      schnittstelle: newDeviceData.value.schnittstelle,
    })

    // Reset and Refresh
    showAddDevice.value = false
    newDeviceData.value = { name: '', geraet_typ_id: null, schnittstelle: '' }

    $q.notify({ color: 'positive', message: 'Device added successfully' })
    fetchDashboardData()
  } catch (err) {
    console.error('Error creating device:', err)
  }
}

// --- State for Invitations ---
const showInviteDialog = ref(false)
const allUsers = ref([]) // List of users to invite
const selectedUserToInvite = ref(null)
const targetHouseIdForInvite = ref(null)

// --- Actions ---

// Open dialog and fetch users if not already loaded
const openInviteDialog = async (houseId) => {
  targetHouseIdForInvite.value = houseId
  showInviteDialog.value = true

  try {
    const res = await api.get('/nutzer')
    // Filter out the current user so they don't invite themselves
    allUsers.value = res.data.filter((u) => u.id !== userStore.currentUser.id)
  } catch (err) {
    console.error('Error fetching users for invitation', err)
  }
}

const sendInvite = async () => {
  if (!selectedUserToInvite.value) return

  try {
    // Matches your route: app.post("/haushaltzuordnung/:haushalt_id", ...)
    await api.post(`/haushaltzuordnung/${targetHouseIdForInvite.value}`, {
      nutzerId: selectedUserToInvite.value,
    })

    showInviteDialog.value = false
    selectedUserToInvite.value = null

    // Notify the user of success
    $q.notify({
      color: 'positive',
      icon: 'person_add',
      message: 'User successfully invited to household!',
    })
  } catch (err) {
    console.error('Error sending invite', err)
  }
}

// --- State for Member List ---
const showMemberList = ref(false)
const householdMembers = ref([])
const currentViewingHouseName = ref('')

// --- Action: Fetch and Show Members ---
const openMemberList = async (house) => {
  currentViewingHouseName.value = house.name
  showMemberList.value = true

  try {
    // Note: This calls your route.
    // If the backend is fixed to filter by haushalt_id, it returns all members.
    const res = await api.get(`/haushaltzuordnung/${house.id}`)

    // To show names, we cross-reference with allUsers (fetched previously)
    // or you could update your backend SQL to JOIN with the Nutzer table.
    householdMembers.value = res.data
  } catch (err) {
    console.error('Error fetching members', err)
  }
}

onMounted(() => {
  fetchTypes()
  fetchDashboardData()
})
</script>
