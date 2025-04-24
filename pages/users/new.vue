<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';
import { AdminStore } from '@/stores/admin';

const adminStore = AdminStore();
definePageMeta({
  middleware: ['auth'],
});

onMounted(() => {
  console.log('clear form')
  adminStore.clearAdminForm()
});

</script>
<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
      </v-card-title>
      <v-card-text>
        <AdminForm :is-creating="true"/>
      </v-card-text>
    </v-card>
  </v-container>
</template>
