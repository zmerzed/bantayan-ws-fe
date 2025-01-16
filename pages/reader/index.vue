<script setup lang="ts">
import ApiError from '@/types/ApiError';
import dayjs from 'dayjs';
import { ref } from 'vue';

definePageMeta({
  middleware: ["reader"],
  layout: 'reader',
});

</script>
<template>
  <v-container fluid>
    reader
  </v-container>
</template>
