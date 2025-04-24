<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';

definePageMeta({
  middleware: ['auth'],
});

const customer = useFetchCustomer();

onMounted(async () => {
  await customer.getCustomer()
});

</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
      </v-card-title>
      <v-card-text>
        <CustomerForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
