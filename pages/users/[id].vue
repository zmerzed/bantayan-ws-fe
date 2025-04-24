<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';

definePageMeta({
  middleware: ['auth'],
});

const admin = useFetchAdmin();
const route = useRoute();

onMounted(async () => {
  await admin.getAdmin(route.params.id)
});

</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
      </v-card-title>
      <v-card-text>
        <AdminForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
