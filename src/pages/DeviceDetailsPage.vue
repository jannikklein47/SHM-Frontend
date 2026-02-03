<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Back to Dashboard" to="/dashboard" class="q-mb-md" />

    <device-detail
      :device="device"
      :sensors="sensors"
      @updated="loadDeviceData"
      @deleted="$router.back()"
    />

    <div v-if="loading" class="flex flex-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div class="col-12">
        <div class="q-mt-xl">
          <div class="text-h5 q-mb-md">Operation History</div>
          <q-card bordered flat>
            <q-table
              flat
              :rows="switchingLogs"
              :columns="[
                {
                  name: 'time',
                  label: 'Time',
                  field: 'zeitpunkt',
                  align: 'left',
                  format: (val) => formatDate(val),
                },
                { name: 'type', label: 'Action', field: 'schaltvorgang_typ_id', align: 'left' },
                { name: 'state', label: 'Resulting State', field: 'name', align: 'center' },
              ]"
              row-key="id"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-state="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.value === 'AN' || props.value === 'ON' ? 'positive' : 'grey-7'"
                    class="q-pa-xs"
                  >
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-type="props">
                <q-td :props="props">
                  {{ getSwitchingTypeName(props.value) }}
                </q-td>
              </template>
            </q-table>

            <div v-if="switchingLogs.length === 0" class="q-pa-md text-center text-grey">
              No operation logs found for this device.
            </div>
          </q-card>
        </div>

        <div class="q-mt-xl">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5">Installed Sensors</div>
            <q-btn
              color="secondary"
              icon="add"
              label="Add Sensor"
              size="sm"
              @click="showAddSensorDialog = true"
            />
          </div>

          <q-card v-for="sensor in sensors" :key="sensor.id" class="q-my-lg" flat bordered>
            <q-card-section class="bg-secondary text-white">
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-h6"> {{ getSensorTypeName(sensor.sensor_typ_id) }}</span>
                  <span class="text-caption">ID: {{ sensor.id }}</span>
                </div>

                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  style="background-color: rgba(255, 255, 255, 0.2)"
                  @click="openDeleteSensorDialog(sensor)"
                >
                  <q-tooltip>Delete Sensor</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-card-section class="bg-secondary text-white">
              <div class="row items-center justify-between">
                <span class="text-h6"> {{ getSensorTypeName(sensor.sensor_typ_id) }}</span>
                <span class="text-caption">Sensor ID: {{ sensor.id }}</span>
              </div>
            </q-card-section>

            <q-card-section>
              <q-table
                flat
                bordered
                :rows="sensor.measurements"
                :columns="[
                  {
                    name: 'time',
                    label: 'Timestamp',
                    field: 'zeitpunkt',
                    align: 'left',
                    format: (val) => formatDate(val),
                  },
                  { name: 'val', label: 'Value', field: 'wert', align: 'right' },
                  { name: 'limit', label: 'Threshold', field: 'schwellenwert', align: 'right' },
                  { name: 'diff', label: 'Status', align: 'center' },
                ]"
                row-key="id"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:body-cell-diff="props">
                  <q-td :props="props">
                    <q-icon
                      v-if="parseFloat(props.row.wert) >= parseFloat(props.row.schwellenwert)"
                      name="error"
                      color="negative"
                      size="sm"
                    >
                      <q-tooltip>Above Threshold</q-tooltip>
                    </q-icon>
                    <q-icon v-else name="check_circle" color="positive" size="sm" />
                  </q-td>
                </template>

                <template v-slot:body-cell-val="props">
                  <q-td :props="props">
                    <div
                      :class="
                        parseFloat(props.value) > parseFloat(props.row.schwellenwert)
                          ? 'text-red text-bold'
                          : ''
                      "
                    >
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <div v-if="sensors.length === 0" class="col-12 text-grey">
            No sensors found for this device.
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="showAddSensorDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add New Sensor</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newSensorData.sensor_typ_id"
            :options="sensorTypes"
            option-value="id"
            option-label="name"
            label="Sensor Type"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="secondary"
            label="Create"
            @click="createSensor"
            :disable="!newSensorData.sensor_typ_id"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

  <q-dialog v-model="showDeleteSensorDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Delete Sensor</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Are you sure you want to delete sensor <b>{{ sensorToDelete?.id }}</b
        >? All associated measurements will be permanently removed.
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="CANCEL" v-close-popup />
        <q-btn color="negative" label="DELETE PERMANENTLY" @click="deleteSensor" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'

// import { date } from 'quasar'
import { date, useQuasar } from 'quasar'
import DeviceDetail from 'src/components/DeviceDetail.vue'

const formatDate = (val) => {
  if (!val) return '-'
  // Formats to "Jan 8, 10:30"
  return date.formatDate(val, 'MMM D, HH:mm')
}

const route = useRoute()
const loading = ref(true)
const sensors = ref([])
const sensorTypes = ref([])

const device = ref({})

// Helper to resolve Type Name
const getSensorTypeName = (id) => {
  const type = sensorTypes.value.find((t) => t.id === id)
  return type ? type.name : 'Unknown'
}

// --- New State for Switching Processes ---
const switchingLogs = ref([])
const switchingTypes = ref([]) // From /typen (schaltvorgang_typ)

const loadDeviceData = async () => {
  loading.value = true
  try {
    // 1. Get Types (Labels for states and process types)
    const typesRes = await api.get('/typen')
    sensorTypes.value = typesRes.data.sensor_typ
    switchingTypes.value = typesRes.data.schaltvorgang_typ

    // 2. Load Sensors and Measurements (as done before)
    const sensorRes = await api.get(`/sensor/${route.params.id}`)
    const sensorList = sensorRes.data
    sensors.value = await Promise.all(
      sensorList.map(async (s) => {
        const mRes = await api.get(`/messungen/${s.id}`)
        return { ...s, measurements: mRes.data }
      }),
    )

    // 3. Load Switching Processes for the Device
    const schaltRes = await api.get(`/schaltvorgaenge/${route.params.id}`)
    switchingLogs.value = schaltRes.data

    // 4. Load the Device
    const deviceRes = await api.get(`/geraetId/${route.params.id}`)
    device.value = deviceRes.data
  } catch (err) {
    console.error('Error loading device full data', err)
  } finally {
    loading.value = false
  }
}

const getSwitchingTypeName = (id) => {
  const type = switchingTypes.value.find((t) => t.id === id)
  return type ? type.name : `Process ${id}`
}

const $q = useQuasar()

// State for Add Sensor Dialog
const showAddSensorDialog = ref(false)
const newSensorData = ref({
  sensor_typ_id: null,
})

// Function to create a new sensor
const createSensor = async () => {
  try {
    await api.post('/sensor', {
      sensor_typ_id: newSensorData.value.sensor_typ_id,
      geraet_id: route.params.id, // ID from url (/device/:id)
    })

    showAddSensorDialog.value = false
    newSensorData.value.sensor_typ_id = null

    // Success notification
    $q.notify({
      color: 'positive',
      message: 'Sensor added successfully',
      icon: 'check',
    })

    // Reload device data to show the new sensor
    loadDeviceData()
  } catch (err) {
    console.error('Error creating sensor:', err)
    $q.notify({
      color: 'negative',
      message: 'Failed to add sensor',
      icon: 'error',
    })
  }
}

// Neue State-Variablen
const showDeleteSensorDialog = ref(false)
const sensorToDelete = ref(null)

// Öffnet den Dialog und merkt sich, welcher Sensor gelöscht werden soll
const openDeleteSensorDialog = (sensor) => {
  sensorToDelete.value = sensor
  showDeleteSensorDialog.value = true
}

// Delete Sensor Function
const deleteSensor = async () => {
  if (!sensorToDelete.value) return

  try {
    await api.delete(`/sensor/${sensorToDelete.value.id}`)

    // UI Feedback
    $q.notify({
      color: 'positive',
      message: 'Sensor deleted successfully.',
      icon: 'delete',
    })

    // close Dialog
    showDeleteSensorDialog.value = false
    sensorToDelete.value = null

    // Refresh device data
    loadDeviceData()
  } catch (err) {
    console.error('Fehler beim Löschen des Sensors:', err)
    $q.notify({
      color: 'negative',
      message: 'Fehler beim Löschen des Sensors.',
      icon: 'error',
    })
  }
}

onMounted(loadDeviceData)
</script>
