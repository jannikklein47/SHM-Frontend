<template>
  <q-card flat bordered class="device-info-card shadow-1">
    <q-card-section class="bg-blue-grey-1 row justify-between">
      <div class="row items-center no-wrap">
        <q-icon name="sensors" color="accent" size="md" class="q-mr-md" />
        <div>
          <div class="text-h6">{{ $props.device.name }}</div>
          <div class="text-caption text-grey-8">ID: {{ $props.device.id }}</div>
        </div>
      </div>

      <div class="row items-center q-gutter-xs">
        <q-btn
          flat
          round
          dense
          size="md"
          color="secondary"
          icon="edit"
          @click.stop="openEditDevice(device)"
        >
          <q-tooltip>Rename Device</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-md row">
      <q-item class="col-auto">
        <q-item-section avatar>
          <q-icon name="category" color="blue-grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Device Type</q-item-label>
          <q-item-label class="text-weight-medium">
            {{ deviceTypeName }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="col-auto">
        <q-item-section avatar>
          <q-icon name="settings_input_antenna" color="blue-grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Interface</q-item-label>
          <q-item-label>{{ $props.device.schnittstelle || 'N/A' }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="col-auto">
        <q-item-section avatar>
          <q-icon name="device_thermostat" color="blue-grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Sensors</q-item-label>
          <q-item-label>{{ $props.sensors.length }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="col-auto">
        <q-item-section avatar>
          <q-icon name="meeting_room" color="blue-grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Room Assignment</q-item-label>
          <q-item-label>Room ID: {{ $props.device.raum_id }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="col-auto">
        <q-item-section avatar>
          <q-icon name="calendar_today" color="blue-grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Registered On</q-item-label>
          <q-item-label>{{ formatTimestamp($props.device.erstellt_am) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>

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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { date, useQuasar } from 'quasar'

const showEditDeviceDialog = ref(false)
const editDeviceData = ref({ id: null, name: '' })

const $q = useQuasar()

const props = defineProps({
  device: {
    type: Object,
    required: true,
    // Expects: { id, name, geraet_typ_id, schnittstelle, erstellt_am, raum_id }
  },
  sensors: {
    type: Array,
    required: false,
  },
})

const emit = defineEmits(['updated'])

const deviceTypes = ref([])

// Resolve the geraet_typ_id to a name
const deviceTypeName = computed(() => {
  const type = deviceTypes.value.find((t) => t.id === props.device.geraet_typ_id)
  return type ? type.name : `Type ${props.device.geraet_typ_id}`
})

// Fetch the type names from your /typen route
const fetchDeviceTypes = async () => {
  try {
    const res = await api.get('/typen')
    deviceTypes.value = res.data.geraet_typ
  } catch (err) {
    console.error('Could not fetch device types', err)
  }
}

const formatTimestamp = (val) => {
  return val ? date.formatDate(val, 'DD.MM.YYYY HH:mm') : 'Unknown'
}

onMounted(fetchDeviceTypes)

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
    emit('updated')
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'An unexpected error occured.', icon: 'error' })
  }
}
</script>

<style scoped>
.device-info-card {
  border-radius: 6px;
}
</style>
