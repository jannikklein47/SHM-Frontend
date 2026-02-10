<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row q-col-gutter-lg justify-center">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center q-pa-lg shadow-2">
          <q-avatar
            size="120px"
            font-size="80px"
            color="primary"
            text-color="white"
            icon="person"
            class="shadow-5"
          />

          <div class="text-h5 q-mt-md">
            {{ userStore.currentUser?.vorname }} {{ userStore.currentUser?.nachname }}
          </div>
          <div class="text-caption text-grey-8 q-mb-md">Smart Home Enthusiast</div>

          <q-separator q-my-md />

          <div class="row text-left q-gutter-y-xs q-mt-md">
            <div class="col-12">
              <q-icon name="fingerprint" class="q-mr-sm" /> ID: {{ userStore.currentUser?.id }}
            </div>
          </div>

          <q-btn
            outline
            color="negative"
            label="Logout"
            icon="logout"
            class="full-width q-mt-lg"
            @click="logout"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <div class="text-h5 q-mb-md text-overline text-grey">Your Smart Life in Numbers</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="bg-indigo-1">
              <q-card-section side>
                <div class="text-overline text-indigo-10">Usage Level</div>
                <div class="text-h4 text-weight-bolder text-indigo-10">
                  Top {{ 100 - stats.usage_level }}%
                </div>
                <div class="text-caption">
                  More active than {{ stats.usage_level }}% of other users
                </div>
              </q-card-section>
              <q-linear-progress :value="stats.usage_level / 100" color="indigo" />
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card flat bordered class="bg-amber-1 text-amber-10">
              <q-card-section>
                <div class="text-overline">Interactions</div>
                <div class="text-h4 text-weight-bolder">{{ stats.interaction_count }}</div>
                <div class="text-caption">Activity Logs</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card flat bordered class="bg-red-1 text-red-10">
              <q-card-section>
                <div class="text-overline">Admin of</div>
                <div class="text-h4 text-weight-bolder">{{ stats.admin_count }}</div>
                <div class="text-caption">Households</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card flat bordered class="bg-green-1 text-green-10">
              <q-card-section>
                <div class="text-overline">Member of</div>
                <div class="text-h4 text-weight-bolder">
                  {{ parseInt(stats.member_count) + parseInt(stats.admin_count) }}
                </div>
                <div class="text-caption">Households</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-banner dense rounded class="bg-grey-3 q-mt-lg">
          <template v-slot:avatar>
            <q-icon name="lightbulb" color="amber" />
          </template>
          <strong>Fun Fact:</strong> {{ funFact }}
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from 'stores/user-store'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const userStore = useUserStore()
const router = useRouter()

// Mock stats - you'll fill these from your future backend routes
const stats = ref({
  interaction_count: 0,
  admin_count: 0,
  member_count: 0,
  usage_level: 0,
})

import { computed } from 'vue'

// ... your existing stats ref ...

const funFact = computed(() => {
  const { interaction_count, admin_count, member_count, usage_level } = stats.value

  const funFacts = []

  // High Usage
  if (usage_level >= 90) {
    funFacts.push(
      "You're in the top 10% of power users! Your house isn't just smart; it's practically sentient at this point.",
    )
  } else if (usage_level >= 80) {
    funFacts.push(
      "You're a power user! Your house is more than just a smart home; it's a digital powerhouse.",
    )
  } else if (usage_level >= 30) {
    funFacts.push(
      "You're a regular user! Your house is a smart home, but not a digital powerhouse.",
    )
  } else {
    funFacts.push("You're a low-usage user! Can you even say that your house is a smart home?")
  }

  // The Administrator
  if (admin_count > 3) {
    funFacts.push(
      `You're managing ${admin_count} households. That's not a smart home setup; that's a digital real estate empire!`,
    )
  }

  // The Social Member
  if (parseInt(member_count) + parseInt(admin_count) > admin_count) {
    funFacts.push(
      "You're a popular guest! You have access to more homes than you actually own. A true digital nomad.",
    )
  }

  // High Interactions
  if (interaction_count > 1000) {
    funFacts.push(
      `With ${interaction_count} interactions, you've pressed more virtual buttons than a 90s elevator operator.`,
    )
  } else if (interaction_count > 575) {
    funFacts.push(
      `With ${interaction_count} interactions, you've done as many interactions as an Airbus A320 cockpit has buttons. `,
    )
  } else if (interaction_count < 30) {
    funFacts.push(
      `With ${interaction_count} interactions, you've done less interactions than the number of keys on your keyboad. Let's start experimenting!`,
    )
  }

  // The Newbie/Minimalist
  if (interaction_count < 1) {
    funFacts.push(
      'A blank slate! Your sensors are waiting for their first command. Time to wake up the house?',
    )
  }

  // Defaults
  funFacts.push(
    'Did you know? Your sensors have been monitoring your home silently to ensure everything is perfect.',
  )
  if (parseInt(member_count) + parseInt(admin_count) > 1) {
    funFacts.push(
      `You have access to ${parseInt(member_count) + parseInt(admin_count)} different front doors. Talk about having the keys to the kingdom.`,
    )
  }

  const randomFact = funFacts[Math.round(Math.random() * (funFacts.length - 1))]
  if (randomFact) {
    return randomFact
  }

  return ''
})

const logout = () => {
  userStore.logout()
  router.push('/')
}

const fetchStats = async () => {
  try {
    const res = await api.get('/profile/' + userStore.currentUser.id)

    stats.value = res.data
  } catch (err) {
    console.error('Stats route not ready yet!', err)
  }
}

onMounted(fetchStats)
</script>
