<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Back to Dashboard" to="/dashboard" class="q-mb-md" />

    <div class="text-h4 q-mb-md">Device Details</div>

    <div v-if="loading" class="flex flex-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div class="col-12">
        <div class="q-mt-xl">
          <div class="text-h5 q-mb-md">Operation History</div>

          <q-card bordered class="shadow-1">
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
        <div class="text-h6 q-mt-xl">Installed Sensors</div>
        <q-card v-for="sensor in sensors" :key="sensor.id" class="q-my-lg shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ getSensorTypeName(sensor.sensor_typ_id) }}</div>
            <div class="text-caption">Sensor ID: {{ sensor.id }}</div>
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
                    name="trending_up"
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
      </div>

      <div v-if="sensors.length === 0" class="col-12 text-grey">
        No sensors found for this device.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'

import { date } from 'quasar'

const formatDate = (val) => {
  if (!val) return '-'
  // Formats to "Jan 8, 10:30"
  return date.formatDate(val, 'MMM D, HH:mm')
}

const route = useRoute()
const loading = ref(true)
const sensors = ref([])
const sensorTypes = ref([])

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

onMounted(loadDeviceData)
</script>
