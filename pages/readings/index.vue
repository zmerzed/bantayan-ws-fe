<script setup lang="ts">
import { ref } from 'vue';
const readingsCompose = useFetchReadings();
const paginationOptions = computed(() => readingsCompose.paginationOptions.value);
const meta = computed(() => paginationOptions.value.listMeta);
const list = computed(() => paginationOptions.value.list);
const { brgys, getList: getBrgys } = useFetchBrgys();
const isFetchingReadings = computed(() => readingsCompose.fetching.value);
const { getList: getReadings } = useFetchReadings();

const formattedDate = (new Date()).toLocaleDateString('en-US', {
  weekday: 'long',  // "Monday"
  year: 'numeric',  // "2025"
  month: 'long',    // "May"
  day: 'numeric'    // "5"
})
const selectedBrgy = ref(null);
const selectedDay = ref(null);

const listOptions = reactive({
  //page: 1,
  //sort: '-created_at',
  per_page: 15,
  generate: true
});
definePageMeta({
  middleware: ['auth'],
});

const page = ref(1);
const search = ref('');
const sortedBy = ref('-created_at');
const loading = ref(false);

const filters = reactive({
  search: '',
  //status_set: null,
  //order_date_range: null
});

async function onGenerateReadings() {
  console.log({
    generated: true,
    barangay_id: selectedBrgy.value,
    day: selectedDay.value,
    fetching: readingsCompose.fetching.value
  })
  await readingsCompose.getList({
    generate: true,
    barangay_id: selectedBrgy.value,
    day: selectedDay.value
  })
}

onMounted(async () => {
  do {
    //await loadList();
    await getBrgys();
  } while (meta.value === undefined);
});


watch([page, search, sortedBy], () => {
  if (search.value.length > 1) {
    page.value = 1;
  }
});

const fields = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'customer', label: 'Customer' },
  { key: 'barangay', label: 'Brgy' },
  { key: 'address', label: 'Address' },
  { key: 'sequence', label: 'Seq.' },
  { key: 'reading_day', label: 'Reading Day' },
  { key: 'meter_reading', label: 'Current Reading' },
  { key: 'prev_meter_reading', label: 'Prev Reading' },
  { key: 'meter_reading_date', label: 'Reading Date' },
  { key: 'reader', label: 'Reader' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Readings</h2>
      </v-card-title>
      <v-card-text>
        <v-card class="mb-2" elevation="0">
          <v-card-text>
            <label>Today's Date:</label>
            <v-chip class="big-chip" color="primary" text-color="white">
              {{ formattedDate }}
            </v-chip>
          </v-card-text>
        </v-card>

        <v-card elevation="0">
          <div class="d-flex" style="gap: 16px; height: 50px">
            <v-select label="Day" :items="[5, 10]" v-model="selectedDay" style="flex: 1" variant="outlined"></v-select>

            <v-select
              label="Barangay"
              variant="outlined"
              :items="brgys"
              item-value="id"
              item-title="name"
              v-model="selectedBrgy"
              style="flex: 1"
            ></v-select>

            <v-btn color="primary" height="100%" :loading="isFetchingReadings" :disabled="!selectedDay || !selectedBrgy" @click="onGenerateReadings">
              Generate
            </v-btn>
          </div>
        </v-card>
      </v-card-text>

      <v-card-text>
        <SimpleTable
          :items="list"
          :fields="fields"
          :pagination="{ currentPage: meta?.current_page, totalPages: meta?.last_page }"
          :loading="isFetchingReadings"
          @change-page="changePage($event)"
          @sort-page="
            sortedBy = $event;
            page = 1;
          "
        >
          <template #cell(customer)="{ item }">
            {{ item.customer?.full_name }}
          </template>
          <template #cell(barangay)="{ item }">
            {{ item.customer?.barangay?.name }}
          </template>
          <template #cell(address)="{ item }">
            {{ item.customer?.address }}
          </template>
          <template #cell(reader)="{ item }">
            <v-chip>
              {{ item.customer?.sequence_detail?.reader?.full_name }}
            </v-chip>
          </template>
          <template #cell(status)="{ item }">
            <UiStatus :status="item.status" />
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <v-btn
                class="ma-1"
                icon="mdi-eye"
                color="primary"
                rounded="xl"
                flat
                size="x-small"
                :to="`/sequences/${item.id}`"
              />
            </div>
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
