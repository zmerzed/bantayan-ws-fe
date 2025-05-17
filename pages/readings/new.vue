<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
import { CustomerStore } from '@/stores/customer';

const customerStore = CustomerStore();
definePageMeta({
  middleware: ['auth'],
});

onMounted(async () => {
  customerStore.clearCustomer()
});

</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
      </v-card-title>
      <v-card-text>
        <CustomerForm :is-creating="true"/>
      </v-card-text>
    </v-card>
  </v-container>
</template>
