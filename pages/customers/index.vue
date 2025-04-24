<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
const customerList = useCustomer();
const paginationOptions = computed(() => customerList.paginationOptions.value)
const meta = computed(() => paginationOptions.value.listMeta)
const list = computed(() => paginationOptions.value.list)

const listOptions = reactive({
  page: 1,
  sort: '-created_at',
  per_page: 15
})
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
})

async function loadList() {
  await customerList.getList(listOptions, filters)
}

onMounted(async () => {
  do {
    await loadList();
  } while (meta.value === undefined);
});

const changePage = async (page:any) => {
  listOptions.page = page
  await loadList()
}

watch([page, search, sortedBy], () => {
  if (search.value.length > 1) {
    page.value = 1;
  }
  loadList();
});

const fields = [
  { key: 'avatar', label: '' },
  { key: 'id', label: 'ID', sortable: true },
  { key: 'account_number', label: 'Account No.', sortable: true },
  { key: 'first_name', label: 'First name', sortable: true },
  { key: 'last_name', label: 'Last name', sortable: true },
  { key: 'barangay', label: 'Brgy', sortable: true },
  { key: 'sequence', label: 'Sequence', sortable: true },
  { key: 'meter_no', label: 'Meter No' },
  { key: 'reading_day', label: 'Reading Day' },
  { key: 'due_day', label: 'Due Day' },
  { key: 'account_type', label: 'Account Type' },
  { key: 'application_type', label: 'Application Type' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Entry Date', sortable: true, format: (value) => dayjs(value).format('DD/MM/YYYY') },
  { key: 'actions', label: '' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Customers</h2>
        <div class="d-flex align-center ml-auto">
          <v-text-field
            placeholder="Search"
            hide-details
            variant="outlined"
            flat
            color="primary"
            style="width: 400px"
            class="mr-2"
            v-model="search"
          >
          </v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <SimpleTable
          :items="list"
          :fields="fields"
          :pagination="{ currentPage: meta?.current_page, totalPages: meta?.last_page }"
          :loading="customerList.fetching.value"
          @change-page="changePage($event)"
          @sort-page="
            sortedBy = $event;
            page = 1;
          "
        >
          <template #cell(meter_no)="{ item }">
            {{ item.details.meter_no }}
          </template>
          <template #cell(reading_day)="{ item }">
            {{ item.details.reading_day }}
          </template>
          <template #cell(due_day)="{ item }">
            {{ item.details.due_day }}
          </template>
          <template #cell(account_type)="{ item }">
            {{ item.account_type }}
          </template>
          <template #cell(barangay)="{ item }">
            {{ item.barangay.name }}
          </template>
          <template #cell(application_type)="{ item }">
            {{ item.application_type }}
          </template>
          <template #cell(status)="{ item }">
            <UiStatus :status="item.status" />
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <v-btn class="ma-1" icon="mdi-eye" color="primary" rounded="xl" flat size="x-small" :to="`/customers/${item.id}`" />
            </div>
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
