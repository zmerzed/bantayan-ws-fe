<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
const adminList = useAdmins();
const paginationOptions = computed(() => adminList.paginationOptions.value)
const meta = computed(() => paginationOptions.value.listMeta)
const list = computed(() => paginationOptions.value.list)

const listOptions = reactive({
  page: 1,
  sort: '-created_at',
  per_page: 5
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
  await adminList.getList(listOptions, filters)
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
  { key: 'id', label: 'ID', sortable: true },
  { key: 'full_name', label: 'Name', sortable: false },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'created_at', label: 'Entry Date', sortable: false, format: (value) => dayjs(value).format('DD/MM/YYYY') },
  { key: 'actions', label: '' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Users</h2>
      </v-card-title>
      <v-card-text>
        <SimpleTable
          :items="list"
          :fields="fields"
          :pagination="{ currentPage: meta?.current_page, totalPages: meta?.last_page }"
          :loading="adminList.fetching.value"
          @change-page="changePage($event)"
          @sort-page="
            sortedBy = $event;
            page = 1;
          "
        >
          <template #cell(status)="{ item }">
            <UiStatus :status="item.status" />
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <v-btn class="ma-1" icon="mdi-eye" color="primary" rounded="xl" flat size="x-small" :to="`/users/${item.id}`" />
            </div>
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
