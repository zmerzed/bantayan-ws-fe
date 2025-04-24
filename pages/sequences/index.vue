<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
const sequenceList = useSequences();
const paginationOptions = computed(() => sequenceList.paginationOptions.value)
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
  await sequenceList.getList(listOptions, filters)
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
  { key: 'number', label: 'Sequence', sortable: false },
  { key: 'barangay', label: 'Barangay', sortable: false },
  { key: 'reader', label: 'Reader', sortable: false },
  { key: 'actions', label: '' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Sequence</h2>
      </v-card-title>
      <v-card-text>
        <SimpleTable
          :items="list"
          :fields="fields"
          :pagination="{ currentPage: meta?.current_page, totalPages: meta?.last_page }"
          :loading="sequenceList.fetching.value"
          @change-page="changePage($event)"
          @sort-page="
            sortedBy = $event;
            page = 1;
          "
        >
          <template #cell(barangay)="{ item }">
            {{ item.barangay?.name }}
          </template>
          <template #cell(reader)="{ item }">
            <v-chip>
                {{ item.reader.full_name }}
            </v-chip>
          </template>
          <template #cell(status)="{ item }">
            <UiStatus :status="item.status" />
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <v-btn class="ma-1" icon="mdi-eye" color="primary" rounded="xl" flat size="x-small" :to="`/sequences/${item.id}`" />
            </div>
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
