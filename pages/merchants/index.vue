<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
import { formatToDayAbbrv } from '@/utils/Helpers';

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
    params: { 
      page, 
      'filter[search]': search, 
      'filter[merchant]': true, 
      include: 'avatar,businessInformation,businessInformation.avatar,businessInformation.businessHours,customerInformation,selectedRewardSystem', 
      sort: sortedBy.value 
    },
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
  { key: 'business_information_name', label: 'Business Name', sortable: true },
  { key: 'business_information_address', label: 'Address', sortable: false },
  { key: 'business_information_phone', label: 'Phone Number', sortable: false },
  { key: 'business_information_hours', label: 'Business Hours', sortable: false },
  { key: 'business_information_reward_system', label: 'Reward System', sortable: false },
  { key: 'business_information_redeem_amount', label: 'Redeem Amount', sortable: false },
  { key: 'actions', label: '' },
];
</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Merchants</h2>
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
          <MerchantDetailDialog
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
          <template #cell(business_information_name)="{ value, item }">
             <strong>{{ item.business_information.name }}</strong>
          </template>
           <template #cell(business_information_address)="{ value, item }">
              {{ item.business_information.address }} 
          </template>
          <template #cell(business_information_phone)="{ value, item }">
              {{ item.business_information.phone }} 
          </template>
          <template #cell(business_information_hours)="{ value, item }">
              <v-chip v-for="(schedule, index) in item.business_information.business_hours" :key="index"  class="mt-2 mr-2" v-show="schedule.availability">
                <strong class="mr-1">{{ formatToDayAbbrv(schedule.day) }}:</strong> {{ formatHourToFrom(schedule) }}
              </v-chip>
          </template>
          <template #cell(business_information_reward_system)="{ value, item }">
              {{ !item.lock_reward_system ? item?.reward_system?.type : '' }} 
          </template>
          <template #cell(business_information_redeem_amount)="{ value, item }">
              {{ !item.lock_reward_system ? item?.reward_system?.redeem_amount : '' }} 
          </template>
          <template #cell(full_name)="{ value, item }">
            <strong>{{ value }}</strong>
          </template>
          <template #cell(actions)="{ item }">
            <div class="d-flex">
              <MerchantDetailDialog :user="item" @load-page="loadUserList()" />
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
