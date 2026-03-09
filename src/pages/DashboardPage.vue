<template>
  <q-page class="q-pa-md">
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
              <q-btn
                flat
                round
                color="negative"
                icon="exit_to_app"
                @click.stop="openLeaveHouse(house)"
              >
                <q-tooltip>Leave Household</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="openDeleteHouse(house)"
                v-if="house.amIAdmin"
              >
                <q-tooltip>Delete Household</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="edit"
                @click.stop="openEditHouse(house)"
                v-if="house.amIAdmin"
              >
                <q-tooltip>Rename Household</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                color="grey-7"
                icon="group"
                @click.stop="openMemberList(house)"
                v-if="house.amIAdmin"
              >
                <q-tooltip>Manage Members</q-tooltip>
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
                  <q-card-section class="bg-primary text-white q-py-sm flex items-center">
                    <div class="text-subtitle1">{{ room.name }}</div>

                    <q-badge color="white" text-color="primary" class="q-ml-sm">
                      {{ room.totalDeviceCount }} Devices
                    </q-badge>
                    <q-space />
                    <q-btn
                      flat
                      round
                      color="white"
                      icon="edit"
                      size="sm"
                      style="background-color: #ffffff20"
                      class="q-mr-sm"
                      @click.stop="openEditRoom(room)"
                    >
                      <q-tooltip>Rename Room</q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      style="background-color: #ff888820"
                      @click.stop="openDeleteRoom(room)"
                      v-if="house.amIAdmin"
                    >
                      <q-tooltip>Delete Room</q-tooltip>
                    </q-btn>
                  </q-card-section>

                  <q-card-section>
                    <div v-if="room.devices.length === 0" class="text-grey text-caption">
                      No devices
                    </div>

                    <q-list dense>
                      <q-item
                        @click="goToDevice(device.id)"
                        clickable
                        v-for="device in room.devices"
                        :key="device.id"
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
                          <div class="row items-center q-gutter-xs">
                            <q-btn
                              flat
                              round
                              dense
                              size="sm"
                              color="secondary"
                              icon="edit"
                              @click.stop="openEditDevice(device)"
                            >
                              <q-tooltip>Rename Device</q-tooltip>
                            </q-btn>
                            <q-icon name="chevron_right" />
                          </div>
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
          <q-separator inset />
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6">Last Activity</div>
              <q-btn
                flat
                dense
                color="secondary"
                icon="history"
                no-caps
                label="View Full History"
                @click="
                  () => {
                    showHistoryDialog = true
                    showHistoryData = { logs: house.logs, name: house.name }
                  }
                "
              />
            </div>
            <q-timeline>
              <q-timeline-entry
                v-for="log in house.logs.slice(0, 1)"
                :key="log.id"
                :title="log.beschreibung"
                :subtitle="formatDate(log.zeitpunkt)"
                :icon="getLogIcon(log)"
                :color="getLogColor(log)"
              >
                <div class="text-caption text-grey-7">
                  <span v-if="log.nutzer_vorname">
                    <strong>{{ log.nutzer_vorname }} {{ log.nutzer_nachname }}</strong>
                  </span>
                  <span v-if="log.geraet_name">
                    Device: <strong>{{ log.geraet_name }}</strong>
                  </span>
                  <span v-if="log.raum_name">
                    Room: <strong>{{ log.raum_name }}</strong>
                  </span>
                  <span v-if="log.sensor_id">
                    Sensor ID: <strong>{{ log.sensor_id }}</strong>
                  </span>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>

        <q-dialog v-model="showMemberList">
          <q-card style="min-width: 500px">
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
                    <q-item-label> {{ member.vorname }} {{ member.nachname }}</q-item-label>
                    <q-item-label caption>Permission Level</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge
                      :color="member.verwaltet ? 'negative' : 'blue'"
                      :label="member.verwaltet ? 'Admin' : 'Member'"
                    />
                  </q-item-section>
                  <q-item-section
                    side
                    v-if="
                      !member.verwaltet &&
                      member.id !== currentUser?.id &&
                      householdMembers.find((member) => member.id === currentUser?.id).verwaltet ===
                        true
                    "
                  >
                    <q-btn
                      icon="close"
                      flat
                      dense
                      @click="removeFromHousehold(member.id, currentViewingHouseId)"
                    >
                      <q-tooltip class="text-body2">Remove from Household</q-tooltip>
                    </q-btn>
                  </q-item-section>
                  <q-item-section
                    side
                    v-if="
                      member.id !== currentUser.id &&
                      !member.verwaltet &&
                      householdMembers.find((member) => member.id === currentUser?.id).verwaltet ===
                        true
                    "
                  >
                    <q-btn
                      flat
                      dense
                      color="secondary"
                      icon="key"
                      @click="assignAdmin(member.id, currentViewingHouseId)"
                    >
                      <q-tooltip class="text-body2">Assign Admin</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>

                <q-item clickable @click="openInviteDialog(currentViewingHouseId)">
                  <q-item-section avatar
                    ><q-avatar color="grey-3" text-color="secondary" icon="person_add"
                  /></q-item-section>
                  <q-item-section>Invite a user to this Household</q-item-section>
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
      </q-expansion-item>
    </div>

    <q-btn
      color="primary"
      icon="add"
      label="New House"
      class="q-mt-md"
      no-caps
      @click="showAddHouse = true"
    />

    <q-btn
      label="Delete account"
      class="q-mt-md q-ml-md bg-negative text-white"
      @click="openDeleteAccount"
    />

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
          <q-btn color="secondary" label="Save Changes" @click="updateHouse" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteHouseDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Delete Household</div></q-card-section>
        <q-card-section class="q-pt-none">
          Do you really want to delete this household? All its information, including rooms,
          devices, sensors, operation history and other data will be unrecoverably deleted. This
          cannot be undone.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Delete permanently" @click="deleteHouse" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showLeaveHouseDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Leave Household</div></q-card-section>
        <q-card-section class="q-pt-none">
          Do you really want to leave this household?
          <span v-if="!leaveHouseData.onlyOneAdmin">You can be re-invited by an admin.</span>
        </q-card-section>
        <q-card-section>
          <div v-if="leaveHouseData.onlyOneAdmin" class="text-bold text-negative">
            You are the only admin of this household. Assign another admin before leaving or this
            household will be deleted.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Leave" @click="leaveHouse" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditRoomDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Rename Room</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="editRoomData.name"
            label="New Name"
            outlined
            dense
            autofocus
            @keyup.enter="updateRoom"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="secondary" label="Save Changes" @click="updateRoom" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteRoomDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Delete Room</div></q-card-section>
        <q-card-section class="q-pt-none">
          Do you really want to delete this room? All its information, including devices, sensors,
          operation history and other data will be deleted.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Delete" @click="deleteRoom" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditDeviceDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Rename Device</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="editDeviceData.name"
            label="Neuer Name"
            outlined
            dense
            autofocus
            @keyup.enter="updateDevice"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn color="secondary" label="Änderungen speichern" @click="updateDevice" />
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
            color="secondary"
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

    <q-dialog v-model="showDeleteAccountDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Delete Account</div></q-card-section>
        <q-card-section class="q-pt-none">
          Do you really want to delete your account? This cannot be undone.
        </q-card-section>
        <q-card-section>
          The following houses do not have another admin. If you delete your account without
          assigning another admin, these households will be permanently deleted.
          <q-list bordered separator class="q-mt-md">
            <q-item v-for="house in deleteAccountData.housesThatWillBeDeleted" :key="house.id">
              <q-item-section>
                <q-item-label>{{ house.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ house.adresse }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  label="View Members"
                  flat
                  dense
                  class="text-accent"
                  v-close-popup
                  @click="openMemberList(house)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="deleteAccountData.housesThatWillBeDeleted.length < 1">
              <q-item-section align="center" class="text-grey-7">
                No Households Affected
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Delete your account" @click="deleteAccount" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showHistoryDialog">
      <q-card>
        <q-card-section>
          <log-timeline :logs="showHistoryData.logs" :household-name="showHistoryData.name" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { useQuasar, date } from 'quasar'
import LogTimeline from 'src/components/LogTimeline.vue'

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

const showDeleteHouseDialog = ref(false)
const deleteHouseData = ref({ id: null, name: '' })

const showLeaveHouseDialog = ref(false)
const leaveHouseData = ref({ id: null, name: '', onlyOneAdmin: null })

const showDeleteAccountDialog = ref(false)
const deleteAccountData = ref({ housesThatWillBeDeleted: [] })

const showEditRoomDialog = ref(false)
const editRoomData = ref({ id: null, name: '' })

const showDeleteRoomDialog = ref(false)
const deleteRoomData = ref({ id: null, name: '' })

const showEditDeviceDialog = ref(false)
const editDeviceData = ref({ id: null, name: '' })

const showAddRoom = ref(false)
const targetHouseId = ref(null)
const newRoomData = ref({ name: '', raum_typ_id: null })

const currentUser = computed(() => userStore.currentUser)

const showHistoryDialog = ref(false)
const showHistoryData = ref({ logs: [], name: '' })

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

        // NEU HINZUFÜGEN: Zähler vom Server holen
        let roomCounts = []
        try {
          const countRes = await api.get(`/roomDeviceCount/${houseId}`)
          roomCounts = countRes.data
        } catch (e) {
          console.warn('Konnte Raum-Statistik nicht laden', e)
        }

        // Get Devices (API returns all devices for a house)
        const dRes = await api.get(`/geraet/${houseId}`)
        const allDevices = dRes.data

        const mRes = await api.get('/haushaltzuordnung/' + houseId)
        const members = mRes.data

        const amIAdmin = members.find((m) => m.id === currentUser.value.id).verwaltet === true

        const logs = (await api.get('/verlauf/' + houseId)).data

        // Map devices into rooms locally
        const roomsWithDevices = rooms.map((room) => {
          const countEntry = roomCounts.find((c) => c.id === room.id)
          const totalCount = countEntry ? countEntry.anzahl_geraete : 0
          return {
            ...room,
            totalDeviceCount: totalCount,
            devices: allDevices.filter((d) => d.raum_id === room.id),
          }
        })

        return {
          ...house,
          id: houseId,
          rooms: roomsWithDevices,
          members,
          amIAdmin,
          logs,
        }
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
    $q.notify({ color: 'positive', message: 'Household renamed.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openDeleteHouse = (house) => {
  deleteHouseData.value = { id: house.id, name: house.name }
  showDeleteHouseDialog.value = true
}

const deleteHouse = async () => {
  try {
    await api.delete(`/haushalt/${deleteHouseData.value.id}`)
    showDeleteHouseDialog.value = false
    $q.notify({ color: 'positive', message: 'Household renamed.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openLeaveHouse = async (house) => {
  let onlyOneAdmin = false
  const result = await api.get('/deleteAccount?nutzer_id=' + userStore.currentUser.id)
  for (const houseWithOneAdmin of result.data) {
    if (houseWithOneAdmin.id === house.id) {
      onlyOneAdmin = true
    }
  }
  leaveHouseData.value = { id: house.id, name: house.name, onlyOneAdmin }
  showLeaveHouseDialog.value = true
}

const leaveHouse = async () => {
  try {
    await api.delete(
      `/haushaltzuordnung/${leaveHouseData.value.id}?nutzer_id=${userStore.currentUser.id}&deleteHouse=${leaveHouseData.value.onlyOneAdmin}`,
    )
    showLeaveHouseDialog.value = false
    $q.notify({ color: 'positive', message: 'Left household.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openEditRoom = (room) => {
  editRoomData.value = { id: room.id, name: room.name }
  showEditRoomDialog.value = true
}

const updateRoom = async () => {
  console.log('Updating Room:', editRoomData.value)
  if (!editRoomData.value.name) return
  try {
    await api.patch(`/raum/${editRoomData.value.id}`, { name: editRoomData.value.name })
    showEditRoomDialog.value = false
    $q.notify({ color: 'positive', message: 'Room renamed.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openDeleteRoom = (room) => {
  deleteRoomData.value = { id: room.id, name: room.name }
  showDeleteRoomDialog.value = true
}

const deleteRoom = async () => {
  try {
    await api.delete(`/raum/${deleteRoomData.value.id}`)
    showDeleteRoomDialog.value = false
    $q.notify({ color: 'positive', message: 'Room deleted.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
  }
}

const openEditDevice = (device) => {
  editDeviceData.value = { id: device.id, name: device.name }
  showEditDeviceDialog.value = true
}

const updateDevice = async () => {
  if (!editDeviceData.value.name || !editDeviceData.value.name.trim()) return
  try {
    await api.patch(`/geraet/${editDeviceData.value.id}`, {
      name: editDeviceData.value.name.trim(),
    })
    showEditDeviceDialog.value = false
    $q.notify({ color: 'positive', message: 'Device renamed.', icon: 'check' })
    fetchDashboardData()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'An unexpected error occured.', icon: 'error' })
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
    allUsers.value = res.data.filter(
      (u) =>
        u.id !== userStore.currentUser.id &&
        !householdMembers.value.map((u) => u.id).includes(u.id),
    )
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

const openDeleteAccount = async () => {
  try {
    deleteAccountData.value.housesThatWillBeDeleted = (
      await api.get('/deleteAccount?nutzer_id=' + userStore.currentUser.id)
    ).data
    showDeleteAccountDialog.value = true
    console.log(deleteAccountData.value.housesThatWillBeDeleted)
  } catch (error) {
    console.error(error)
  }
}

const deleteAccount = async () => {
  try {
    await api.delete('/deleteAccount?nutzer_id=' + userStore.currentUser.id)
    $q.notify({ type: 'positive', message: 'Account deleted successfully' })
    userStore.logout()
  } catch (error) {
    console.error(error)
  }
}

// --- State for Member List ---
const showMemberList = ref(false)
const householdMembers = ref([])
const currentViewingHouseName = ref('')
const currentViewingHouseId = ref(null)

// --- Action: Fetch and Show Members ---
const openMemberList = async (house) => {
  currentViewingHouseName.value = house.name
  currentViewingHouseId.value = house.id
  showMemberList.value = true

  try {
    const res = await api.get(`/haushaltzuordnung/${house.id}`)

    householdMembers.value = res.data
  } catch (err) {
    console.error('Error fetching members', err)
  }
}

const removeFromHousehold = async (userId, houseId) => {
  try {
    const res = await api.delete(`/haushaltzuordnung/${houseId}?nutzer_id=${userId}`)

    if (res.status === 200) {
      showMemberList.value = false
      fetchDashboardData()
      $q.notify({
        type: 'positive',
        message: 'User removed from household successfully',
      })
      openMemberList({ id: houseId, name: currentViewingHouseName.value })
    }
  } catch (error) {
    console.error('Error removing user from household:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to remove user from household',
    })
  }
}

const assignAdmin = async (userId, houseId) => {
  try {
    const res = await api.patch('/haushaltzuordnung/' + houseId, {
      nutzer_id: userId,
      verwaltet: true,
    })

    if (res.status === 200) {
      showMemberList.value = false
      fetchDashboardData()
      $q.notify({
        type: 'positive',
        message: 'User assigned as admin successfully',
      })
      openMemberList({ id: houseId, name: currentViewingHouseName.value })
    }
  } catch (error) {
    console.error('Error assigning user as admin:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to assign user as admin',
    })
  }
}

onMounted(() => {
  fetchTypes()
  fetchDashboardData()
})

const formatDate = (ts) => date.formatDate(ts, 'MM.DD.YYYY, HH:mm:ss')

// Dynamic styling based on log content
const getLogIcon = (log) => {
  if (log.nutzer_id) return 'person'
  if (log.geraet_id) return 'smart_button'
  if (log.sensor_id) return 'sensors'
  return 'history'
}

const getLogColor = (log) => {
  if (log.beschreibung?.toLowerCase().includes('alarm')) return 'negative'
  if (log.nutzer_id) return 'primary'
  return 'secondary'
}
</script>
