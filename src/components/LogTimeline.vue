<template>
  <div class="q-pa-md">
    <q-timeline color="secondary">
      <q-timeline-entry
        v-for="log in logs"
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
  </div>
</template>

<script setup>
import { date } from 'quasar'

defineProps(['logs', 'householdName'])

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
