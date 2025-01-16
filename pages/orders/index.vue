<script setup lang="ts">
import dayjs from 'dayjs'
import {getStatus} from "~/types/Order";

const orderList = useOrder({isInfinite: false});
const paginationOptions = computed(() => orderList.paginationOptions.value)
const meta = computed(() => paginationOptions.value.listMeta)
const list = computed(() => paginationOptions.value.list)

const listOptions = reactive({
  page: 1,
  sort: '-created_at',
  per_page: 10
})

const filters = reactive({
  search: '',
  status_set: null,
  order_date_range: null
})

const fields = ref([
  {key: 'id', label: 'ID', sortable: true},
  {key: 'order_number', label: 'Order Number', sortable: true},
  {key: 'created_at', label: 'Date', date_range: true},
  {key: 'quantity', label: 'Ttl. Qty', sortable: true},
  {key: 'amount', label: 'Ttl Amount Paid', sortable: true},
  {key: 'seller_id', label: 'Merchant'},
  {key: 'total_points_gained', label: 'Point/Stamp Earned', sortable: true},
  {key: 'user_id', label: 'Customer'},
  {key: 'status', label: 'Transaction Status', multi_select: true, items: [
    { value: 'PENDING', label: 'PENDING', selected: false },
    { value: 'COMPLETED', label: 'COMPLETED', selected: false },
    { value: 'PENDING_PAYMENT', label: 'PENDING PAYMENT', selected: false },
    { value: 'CONFIRMED_PAYMENT', label: 'CONFIRMED PAYMENT', selected: false },
    { value: 'PROCESSING', label: 'PROCESSING', selected: false },
    { value: 'READY_FOR_PICKUP', label: 'READY FOR PICKUP', selected: false },
    { value: 'CONFIRMED_PICKUP', label: 'CONFIRMED PICKUP', selected: false },
    { value: 'CANCELLED', label: 'CANCELLED', selected: false },
    { value: 'REFUNDED', label: 'REFUNDED', selected: false },
    { value: 'CANCELLED_AND_REFUNDED', label: 'CANCELLED & REFUNDED', selected: false },
    { value: 'CANCELLED_AND_NOT_REFUNDED', label: 'CANCELLED & NOT REFUNDED', selected: false },
  ] },
  {key: 'refund_status', label: 'Refund Status'},
])

async function loadList() {
  await orderList.getList(listOptions, filters)
}

const search = useDebounce(() => {
  if (filters.search.length > 1) {
    listOptions.page = 1;
  }
  loadList()
}, 500)

function changePage($event: number) {
  listOptions.page = $event;
}

function handleSortPage($event: any) {
  listOptions.page = 1
  listOptions.sort = $event
}

function handleFilter($event: any) {
  
  if ($event.filter_type === 'status') {
    filters.status_set = $event.data.filter((item: object) => {
      console.log('item', item)
      return item.selected
    }).map((item: object) => {
      return item.value
    }).join('|')
    loadList()
  } else if($event.filter_type === 'date_range') {
    filters.order_date_range = dayjs($event.date_from).format('YYYY/MM/DD') + "|" + dayjs($event.date_to).format('YYYY/MM/DD');
    loadList();
  }
}

watch([() => listOptions.page, () => listOptions.sort], useDebounce(() => {
  loadList();
}, 400));

onMounted(async () => {
  await nextTick();
  await loadList()
})
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mb-4">Orders</h2>
        <div class="d-flex align-center ml-auto">
          <v-text-field
              @input="search"
              placeholder="Search"
              hide-details
              variant="outlined"
              flat
              color="primary"
              style="width: 400px"
              class="mr-2"
              v-model="filters.search"
          >
          </v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <SimpleTable
            :multi-sort="false"
            must-sort
            :items="list"
            :fields="fields"
            :pagination="{ currentPage: meta.current_page, totalPages: meta.last_page }"
            :loading="orderList.fetching.value"
            @change-page="changePage"
            @sort-page="handleSortPage"
            @multi-filter="handleFilter"
        >
          <template #cell(seller_id)="{ item }">
            <div class="d-flex align-items-center">
              <UserDetailDialog :user="item.seller" @load-page="loadList()"/>
              <Avatar :avatar="item.seller.avatar" :name="item.seller.business_name"/>
            </div>
          </template>
          <template #cell(user_id)="{ item }">
            <div class="d-flex align-items-center">
              <UserDetailDialog :user="item.buyer" @load-page="loadList()"/>
              <Avatar :avatar="item.buyer.avatar" :name="item.buyer.full_name"/>
            </div>
          </template>
          <template #cell(total_points_gained)="{ value, item }">
            <v-icon size="20px" icon="mdi-bitcoin"></v-icon>
            <strong>{{ value }}</strong> <br /> {{ item.reward_system}}
          </template>
          <template #cell(id)="{ value, item }">
            <strong>{{ value }}</strong>
          </template>
          <template #cell(order_number)="{ value, item }">
            <strong>#{{ value }}</strong>
          </template>
          <template #cell(status)="{ value, item }">
            <v-chip :color="getStatus(value.toUpperCase()).color">{{ getStatus(value.toUpperCase()).title }}</v-chip>
          </template>
          <template #cell(refund_status)="{ value, item }">
            N/A
          </template>
          <template #cell(created_at)="{ item }">
            {{ dayjs(item.created_at).format('DD/MM/YYYY') }}
          </template>
        </SimpleTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
