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

            <div class="q-mt-xl">
              <div class="row items-center justify-between q-mb-md">
                <q-space />
                <q-btn
                  class="q-mr-md"
                  color="secondary"
                  icon="add"
                  label="Add Operation"
                  size="sm"
                  @click="showAddOperationDialog = true"
                />
              </div>
            </div>

            <q-dialog v-model="showAddOperationDialog">
              <q-card style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Record Operation</div>
                </q-card-section>

                <q-card-section class="q-gutter-md">
                  <q-select
                    v-model="newOperationData.type_id"
                    :options="switchingTypes"
                    option-value="id"
                    option-label="name"
                    label="Operation Type (e.g. Manual)"
                    outlined
                    dense
                    emit-value
                    map-options
                  />

                  <q-select
                    v-model="newOperationData.state_id"
                    :options="stateTypes"
                    option-value="id"
                    option-label="name"
                    label="Resulting State (e.g. ON)"
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
                    label="Save"
                    @click="createOperation"
                    :disable="!newOperationData.type_id || !newOperationData.state_id"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <div v-if="switchingLogs.length === 0" class="q-pa-md text-center text-grey">
              No operation logs found for this device.
            </div>
          </q-card>
        </div>

        <div class="q-mt-xl" v-if="alarmStats.length > 0">
          <div class="text-h5 q-mb-md">Alarm History</div>
          <q-card bordered flat>
            <q-table
              flat
              :rows="alarmStats"
              :columns="[
                {
                  name: 'time',
                  label: 'Time',
                  field: 'zeitpunkt',
                  align: 'left',
                  format: (val) => formatDate(val),
                },
                { name: 'type', label: 'Sensor Type', field: 'messart', align: 'left' },
                { name: 'val', label: 'Value', field: 'wert', align: 'right' },
                { name: 'limit', label: 'Threshold', field: 'schwellenwert', align: 'right' },
                {
                  name: 'percent',
                  label: 'Exceeded by',
                  field: 'ueberschreitung_prozent',
                  align: 'right',
                },
              ]"
              row-key="alarm_id"
              :pagination="{ rowsPerPage: 5 }"
            >
              <template v-slot:body-cell-val="props">
                <q-td :props="props" class="text-weight-bold text-negative">
                  {{ props.value }}
                </q-td>
              </template>
              <template v-slot:body-cell-percent="props">
                <q-td :props="props" class="text-negative"> +{{ props.value }}% </q-td>
              </template>
            </q-table>
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
            <q-card-section
              v-if="getAverageValue(sensor.id)"
              class="bg-blue-1 text-blue-9"
              style="border-bottom: 1px solid #bbdefb"
            >
              <div class="row items-center">
                <q-icon name="functions" class="q-mr-sm" size="sm" />
                <div class="text-body2">
                  <strong>Historical average:</strong> All measurements from this sensor yield an
                  average value of <strong>{{ getAverageValue(sensor.id) }}</strong
                  >.
                </div>
              </div>
            </q-card-section>

            <q-card-section
              v-if="getAverageDeviation(sensor.id)"
              class="bg-orange-1 text-orange-9"
              style="border-bottom: 1px solid #ffe0b2"
            >
              <div class="row items-center">
                <q-icon name="warning" class="q-mr-sm" size="sm" />
                <div class="text-body2">
                  <strong>Alarm Severity:</strong> When this sensor triggers an alarm, it exceeds
                  the threshold by an average of
                  <strong>{{ getAverageDeviation(sensor.id) }}%</strong>.
                </div>
              </div>
            </q-card-section>

            <q-card-section class="bg-secondary text-white">
              <q-btn
                flat
                dense
                round
                icon="add_chart"
                color="white"
                style="background-color: rgba(255, 255, 255, 0.2)"
                class="q-mr-sm"
                @click="openAddMeasurementDialog(sensor)"
              >
                <q-tooltip>Add Measurement</q-tooltip>
              </q-btn>
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
    <q-dialog v-model="showAddMeasurementDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Record New Measurement</div>
          <div class="text-caption text-grey">Sensor ID: {{ targetSensorId }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model.number="newMeasurementData.value"
            label="Value (e.g., Temperature in °C)"
            type="number"
            outlined
            dense
            autofocus
          />

          <q-input
            v-model.number="newMeasurementData.threshold"
            label="Threshold (Limit)"
            type="number"
            outlined
            dense
            hint="At what value is this critical?"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="secondary"
            label="Save"
            @click="createMeasurement"
            :disable="
              (!newMeasurementData.value && newMeasurementData.value !== 0) ||
              !newMeasurementData.threshold
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
  </q-page>
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

const averageReadings = ref([])
const averageDeviations = ref([])
const alarmStats = ref([])
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
    // 1. Get Types
    const typesRes = await api.get('/typen')
    sensorTypes.value = typesRes.data.sensor_typ
    switchingTypes.value = typesRes.data.schaltvorgang_typ
    stateTypes.value = typesRes.data.zustand // <--- NEW: Store states

    // ... existing sensor loading logic ...
    const sensorRes = await api.get(`/sensor/${route.params.id}`)
    const sensorList = sensorRes.data
    sensors.value = await Promise.all(
      sensorList.map(async (s) => {
        const mRes = await api.get(`/messungen/${s.id}`)
        return { ...s, measurements: mRes.data }
      }),
    )

    // ... existing switching logs logic ...
    const schaltRes = await api.get(`/schaltvorgaenge/${route.params.id}`)
    switchingLogs.value = schaltRes.data

    // ... existing device loading logic ...
    const deviceRes = await api.get(`/geraetId/${route.params.id}`)
    device.value = deviceRes.data

    const avgRes = await api.get(`/averageReading/${route.params.id}`)
    averageReadings.value = avgRes.data
    const devStatsRes = await api.get(`/deviceSensorAverageDifference/${route.params.id}`)
    averageDeviations.value = devStatsRes.data

    const alarmRes = await api.get(`/deviceAlarmStats/${route.params.id}`)
    alarmStats.value = alarmRes.data
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
    console.error('Error deleting sensor:', err)
    $q.notify({
      color: 'negative',
      message: 'Error deleting sensor.',
      icon: 'error',
    })
  }
}

const showAddMeasurementDialog = ref(false)
const targetSensorId = ref(null)
const newMeasurementData = ref({
  value: '',
  threshold: 20, // Default value for convenience
})

// --- ACTIONS ---

// 1. Open Dialog and store which sensor we are adding data to
const openAddMeasurementDialog = (sensor) => {
  targetSensorId.value = sensor.id
  // Reset value input, keep threshold default or reset it too
  newMeasurementData.value.value = ''
  showAddMeasurementDialog.value = true
}

// 2. Send data to Backend
const createMeasurement = async () => {
  try {
    // Matches our new English backend route /measurement
    await api.post('/messungen', {
      sensor_id: targetSensorId.value,
      wert: newMeasurementData.value.value,
      schwellenwert: newMeasurementData.value.threshold,
    })

    // UI Feedback
    $q.notify({
      color: 'positive',
      message: 'Measurement saved successfully!',
      icon: 'cloud_upload',
    })

    // Close Dialog
    showAddMeasurementDialog.value = false

    // IMPORTANT: Refresh data so the new value appears in the table immediately
    await loadDeviceData()
  } catch (err) {
    console.error('Error saving measurement:', err)
    $q.notify({
      color: 'negative',
      message: 'Failed to save measurement.',
      icon: 'error',
    })
  }
}

// ... existing imports ...

// --- NEW REFS ---
const stateTypes = ref([]) // To store options for ON, OFF, etc.
const showAddOperationDialog = ref(false)
const newOperationData = ref({
  type_id: null,
  state_id: null,
})

// Update the loadDeviceData function to also fetch 'zustand'

// --- NEW ACTION: Create Operation ---
const createOperation = async () => {
  try {
    await api.post('/operations', {
      device_id: route.params.id,
      type_id: newOperationData.value.type_id,
      state_id: newOperationData.value.state_id,
    })

    $q.notify({
      color: 'positive',
      message: 'Operation recorded successfully',
      icon: 'check',
    })

    showAddOperationDialog.value = false
    newOperationData.value = { type_id: null, state_id: null }

    // Refresh data to show new entry in table
    loadDeviceData()
  } catch (err) {
    console.error('Error creating operation:', err)
    $q.notify({
      color: 'negative',
      message: 'Failed to record operation',
      icon: 'error',
    })
  }
}

const getAverageValue = (sensorId) => {
  const item = averageReadings.value.find((x) => x.id === sensorId)
  if (!item || !item.durchschnittswert) return null
  return parseFloat(item.durchschnittswert).toFixed(2)
}

const getAverageDeviation = (sensorId) => {
  const item = averageDeviations.value.find((x) => x.id === sensorId)
  if (!item || item.durchschnitt === null || item.durchschnitt === undefined) return null
  return parseFloat(item.durchschnitt).toFixed(2)
}

onMounted(loadDeviceData)
</script>
