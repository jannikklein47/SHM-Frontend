<template>
  <q-page class="q-pa-md">
    <device-detail
      :device="device"
      :sensors="sensors"
      @updated="loadDeviceData"
      @deleted="$router.back()"
    />

    <q-btn
      class="bg-grey-2 q-ma-md"
      no-caps
      icon="add"
      label="Send a Command"
      flat
      rounded
      @click="showAddOperationDialog = true"
    />

    <div class="q-mt-xl">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Installed Sensors</div>
        <q-btn
          icon="add"
          label="Add Sensor"
          flat
          rounded
          no-caps
          style="background-color: #00000011"
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
              <strong>Alarm Severity:</strong> When this sensor triggers an alarm, it exceeds the
              threshold by an average of <strong>{{ getAverageDeviation(sensor.id) }}%</strong>.
            </div>
          </div>
        </q-card-section>

        <q-card-section class="bg-secondary text-white">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-sm">
              <span class="text-h6"> {{ getSensorTypeName(sensor.sensortypeid) }}</span>
              <span class="text-caption">Threshold for Alarms: {{ sensor.threshold }}</span>
            </div>

            <q-space />

            <q-btn
              flat
              label="Measurement"
              no-caps
              rounded
              icon="add_chart"
              color="white"
              style="background-color: rgba(255, 255, 255, 0.2)"
              class="q-mr-sm"
              @click="openAddMeasurementDialog(sensor)"
            >
              <q-tooltip>Add Measurement</q-tooltip>
            </q-btn>

            <q-btn
              flat
              rounded
              no-caps
              label="Delete"
              icon="delete"
              color="negative"
              style="background-color: rgba(255, 0, 0, 0.2)"
              @click="openDeleteSensorDialog(sensor)"
            >
              <q-tooltip>Delete Sensor</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section>
          <VueApexCharts
            :options="sensor.options"
            :series="sensor.series"
            type="line"
            height="350"
          />
        </q-card-section>
      </q-card>

      <div v-if="sensors.length === 0" class="col-12 text-grey">
        No sensors found for this device.
      </div>
    </div>

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
                  field: 'timestamp',
                  align: 'left',
                  format: (val) => formatDate(val),
                },
                { name: 'type', label: 'Action', field: 'operationtypeid', align: 'left' },
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

            <q-dialog
              v-model="showAddOperationDialog"
              @show="allCombinationsAnimation = true"
              @before-hide="allCombinationsAnimation = false"
            >
              <q-card style="min-width: 350px; max-height: 80vh">
                <q-card-section class="bg-primary text-white flex">
                  <div class="text-h6">Send a Command</div>
                  <q-space />
                  <q-btn flat dense round icon="close" v-close-popup />
                </q-card-section>

                <q-card-section>
                  <q-select
                    v-model="newOperationData.type_id"
                    :options="switchingTypes"
                    option-value="id"
                    option-label="name"
                    label="Action"
                    outlined
                    dense
                    emit-value
                    map-options
                    @update:model-value="newOperationData.state_id = null"
                    class="q-mb-md"
                  />

                  <q-select
                    v-if="newOperationData.type_id"
                    v-model="newOperationData.state_id"
                    :options="
                      stateTypes.filter((st) => st.operationtypeid === newOperationData.type_id)
                    "
                    option-value="id"
                    option-label="name"
                    label="State"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="q-mb-md"
                  />
                  <span v-else class="text-subtitle2 text-grey-7">
                    Choose an action before setting the state.
                  </span>
                </q-card-section>

                <q-card-section>
                  <q-expansion-item
                    label="What types of commands does this device support?"
                    expand-separator
                    style="border-radius: 12px"
                    class="bg-grey-2"
                    v-model="allCombinationsAnimation"
                  >
                    <q-separator />
                    <q-list separator>
                      <q-item v-for="command in allCommandCombinations" :key="command">
                        <q-item-section>
                          <span style="display: flex; gap: 4px; align-items: center">
                            <span class="text-bold">{{ command.operationtypename }}</span>
                            {{ command.statename }}
                            <q-space />
                            <q-btn
                              label="Choose"
                              flat
                              no-caps
                              rounded
                              class="bg-white"
                              @click="
                                () => {
                                  newOperationData.type_id = command.operationtypeid
                                  newOperationData.state_id = command.stateid
                                }
                              "
                            />
                          </span>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-card-section>

                <q-card-section class="flex">
                  <q-btn flat label="Cancel" v-close-popup class="bg-grey-2" rounded />
                  <q-space />
                  <q-btn
                    rounded
                    color="secondary"
                    label="Send"
                    flat
                    class="bg-grey-2"
                    @click="createOperation"
                    :disable="!newOperationData.type_id || !newOperationData.state_id"
                  />
                </q-card-section>
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
                  field: 'timestamp',
                  align: 'left',
                  format: (val) => formatDate(val),
                },
                { name: 'type', label: 'Sensor Type', field: 'sensortype', align: 'left' },
                { name: 'val', label: 'Value', field: 'value', align: 'right' },
                {
                  name: 'percent',
                  label: 'Exceeded by',
                  field: 'exceededpercent',
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
      </div>
    </div>

    <q-dialog v-model="showAddSensorDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white q-mb-md">
          <div class="text-h6">Add New Sensor</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newSensorData.sensorTypeId"
            :options="sensorTypes"
            option-value="id"
            option-label="name"
            label="Sensor Type"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-md"
          />
          <q-input
            v-model="newSensorData.threshold"
            label="Threshold (Limit)"
            type="number"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps rounded class="bg-grey-2" />
          <q-btn
            color="secondary"
            class="bg-grey-2"
            label="Create"
            flat
            no-caps
            rounded
            @click="createSensor"
            :disable="!newSensorData.sensorTypeId || newSensorData.threshold === null"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showAddMeasurementDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white q-mb-md">
          <div class="text-h6">Record New Measurement</div>
          <div class="text-caption text-grey-4">Sensor ID: {{ targetSensorId }}</div>
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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup class="bg-grey-2" rounded />
          <q-btn
            color="secondary"
            rounded
            label="Save"
            class="bg-grey-2"
            flat
            @click="createMeasurement"
            :disable="newMeasurementData.value === null"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteSensorDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-negative text-white q-mb-md">
          <div class="text-h6">Delete Sensor</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete sensor <b>{{ sensorToDelete?.id }}</b
          >? All associated measurements will be permanently removed.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps rounded class="bg-grey-2" />
          <q-btn
            color="negative"
            label="DELETE PERMANENTLY"
            @click="deleteSensor"
            flat
            rounded
            class="bg-red-1"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import VueApexCharts from 'vue3-apexcharts'

// import { date } from 'quasar'
import { date, useQuasar } from 'quasar'
import DeviceDetail from 'src/components/DeviceDetail.vue'

const formatDate = (val) => {
  if (!val) return '-'
  // Formats to "Jan 8, 10:30"
  return date.formatDate(val, 'MMM D, HH:mm')
}

const interfaces = ref([])

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
const switchingTypes = ref([])
const allCombinationsAnimation = ref(false)
const allCommandCombinations = ref([])

const loadDeviceData = async () => {
  loading.value = true
  try {
    // ... existing sensor loading logic ...
    const sensorRes = await api.get(`/sensor/${route.params.id}`)
    const sensorList = sensorRes.data
    sensors.value = await Promise.all(
      sensorList.map(async (s) => {
        const mRes = await api.get(`/measurement/${s.id}`)
        return {
          ...s,
          measurements: mRes.data,
          series: [
            {
              name: 'Measurements',
              data: mRes.data.map((m) => {
                return [new Date(m.timestamp), m.value]
              }),
            },
          ],
          options: {
            chart: {
              type: 'line',
            },
            // 1. The Threshold Line
            annotations: {
              yaxis: [
                {
                  y: s.threshold,
                  borderColor: '#FF0000',
                  label: {
                    borderColor: '#FF0000',
                    style: { color: '#fff', background: '#FF0000' },
                    text: 'Threshold',
                  },
                },
                {
                  y: s.threshold,
                  y2: 10000, // A high number ensures it covers the top of the chart
                  borderColor: '#FF0000',
                  fillColor: '#FF0000',
                  opacity: 0.1, // Keep it light so you can still see the grid/line
                },
              ],
            },
            // 2. Color the line based on the threshold
            stroke: {
              width: 3,
              curve: 'smooth',
            },
            xaxis: {
              type: 'datetime',
              labels: {
                show: true,
                rotate: -45, // Rotate if labels are long
                style: {
                  colors: '#78909C', // Custom color (use Quasar variables if needed)
                  fontSize: '12px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                },
                datetimeFormatter: {
                  year: 'yyyy',
                  month: "MMM 'yy",
                  day: 'dd MMM',
                  hour: 'dd MMM HH:mm', // <--- This forces the day to show with the hour
                },
              },
            },
            yaxis: {
              min: 0,
            },
            tooltip: {
              custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const customElement = document.createElement('div')
                console.log(w)
                const value = series[seriesIndex][dataPointIndex]
                customElement.style.padding = '10px'
                const top = document.createElement('div')
                const bot = document.createElement('div')
                const sub = document.createElement('div')
                top.innerText = 'Measurement: ' + value
                bot.innerText = value >= s.threshold ? 'This Measurement Caused an Alarm.' : ''
                sub.innerText =
                  'Time: ' + new Date(w.seriesData.seriesX[0][dataPointIndex]).toLocaleString()
                top.style.color = value >= s.threshold ? 'red' : 'green'
                bot.classList.add('text-weight-light')
                top.classList.add('text-weight-bold')
                sub.classList.add('text-weight-light', 'text-italic', 'text-caption')
                customElement.appendChild(top)
                customElement.appendChild(bot)
                customElement.appendChild(sub)
                return customElement
              },
            },
          },
        }
      }),
    )

    console.log('Sensors:', sensors.value)

    // ... existing switching logs logic ...
    const schaltRes = await api.get(`/operation/${route.params.id}`)
    switchingLogs.value = schaltRes.data

    // ... existing device loading logic ...
    const deviceRes = await api.get(`/device/${route.params.id}`)

    device.value = deviceRes.data

    console.log('Device:', device.value)

    const typesRes = await api.get('/type?deviceTypeId=' + (device.value.devicetypeid || ''))

    console.log('types:', typesRes.data)

    sensorTypes.value = typesRes.data.sensorType
    switchingTypes.value = typesRes.data.operationType
    stateTypes.value = typesRes.data.state
    allCommandCombinations.value = typesRes.data.allCombinations
    interfaces.value = typesRes.data.interface

    const avgRes = await api.get(`/device/averageReading/${route.params.id}`)
    averageReadings.value = avgRes.data
    const devStatsRes = await api.get(`/device/averageSensorDiff/${route.params.id}`)
    averageDeviations.value = devStatsRes.data

    const alarmRes = await api.get(`/device/alarmStats/${route.params.id}`)
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
  sensorTypeId: null,
  threshold: null,
})

// Function to create a new sensor
const createSensor = async () => {
  try {
    await api.post('/sensor', {
      sensorTypeId: newSensorData.value.sensorTypeId,
      threshold: newSensorData.value.threshold,
      deviceId: route.params.id, // ID from url (/device/:id)
    })

    showAddSensorDialog.value = false
    newSensorData.value.sensorTypeId = null
    newSensorData.value.threshold = null

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
    await api.post('/measurement', {
      sensorId: targetSensorId.value,
      value: newMeasurementData.value.value,
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
    await api.post('/operation', {
      deviceId: route.params.id,
      typeId: newOperationData.value.type_id,
      stateId: newOperationData.value.state_id,
    })

    $q.notify({
      color: 'positive',
      message: 'Operation recorded successfully',
      icon: 'check',
    })

    showAddOperationDialog.value = false
    newOperationData.value = { type_id: null, state_id: null }

    // Refresh data to show new entry in table
    allCombinationsAnimation.value = false
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
  if (!item || !item.averagereading) return null
  return parseFloat(item.averagereading).toFixed(2)
}

const getAverageDeviation = (sensorId) => {
  const item = averageDeviations.value.find((x) => x.id === sensorId)
  if (!item || item.average === null || item.average === undefined) return null
  return parseFloat(item.average).toFixed(2)
}

onMounted(loadDeviceData)
</script>
