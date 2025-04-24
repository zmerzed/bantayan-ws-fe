<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';

definePageMeta({
  middleware: ['auth'],
});

const list = ref([]);
const meta = ref({});

const page = ref(1);
const search = ref('');
const sortedBy = ref('-created_at');
const loading = ref(false);

const loadUserList = async () => {
  loading.value = true;
  const { data, error } = await useApi('/users', {
    method: 'GET',
    params: { page, 'filter[search]': search, 'filter[customer]': 1, include: 'avatar', sort: sortedBy.value },
  });

  if (error.value) {
    throw new ApiError(error.value);
  }

  list.value = data.value?.data ?? [];
  meta.value = data.value?.meta;
  loading.value = false;
};

onMounted(async () => {
  do {
    await loadUserList();
  } while (meta.value === undefined);
});

watch([page, search, sortedBy], () => {
  if (search.value.length > 1) {
    page.value = 1;
  }
  loadUserList();
});

const { deleteLoading, showConfirmDelete, handleDelete, selectedUser } = useDeleteUser();

const fields = [
  { key: 'avatar', label: '' },
  { key: 'first_name', label: 'First name', sortable: true },
  { key: 'last_name', label: 'Last name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone_number', label: 'Phone Number' },
  { key: 'member_id_dashed', label: 'Membership ID' },
  { key: 'role', label: 'Role' },
  { key: 'created_at', label: 'Join Date', sortable: true, format: (value) => dayjs(value).format('DD/MM/YYYY') },
  { key: 'actions', label: '' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Users</h2>
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
          <UserDetailDialog
            :is-creating="true"
            @load-page="
              page = 1;
              loadUserList();
            "
          />
        </div>
      </v-card-title>
      <v-card-text>
        <SimpleTable
          :items="list"
          :fields="fields"
          :pagination="{ currentPage: meta?.current_page, totalPages: meta?.last_page }"
          :loading="loading"
          @change-page="page = $event"
          @sort-page="
            sortedBy = $event;
            page = 1;
          "
        >
          <template #cell(avatar)="{ value }">
            <Avatar :avatar="value" />
          </template>
          <template #cell(full_name)="{ value, item }">
            <strong>{{ value }}</strong>
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <UserDetailDialog :user="item" @load-page="loadUserList()" />
              <v-btn
                class="ma-1"
                icon="mdi-delete"
                color="error"
                rounded="xl"
                flat
                size="x-small"
                @click="
                  selectedUser = item;
                  showConfirmDelete = true;
                "
              />
            </div>
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>

    <ConfirmDialog
      v-model="showConfirmDelete"
      title="Delete User"
      description="This action cannot be undone"
      :loading="deleteLoading"
      @confirm="handleDelete(undefined, () => loadUserList())"
      @cancel="showConfirmDelete = false"
    />
  </v-container>
</template>
