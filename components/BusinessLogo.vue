<script lang="ts" setup>
import defaultProfileImg from '@/assets/img/default-profile.png';
const props = defineProps<{
  logo?: {
    url: string;
    thumb_url: string;
  };
  size?: string;
  tile?: boolean;
}>();

const size = computed(() => props.size ?? '30px');
const src = computed(() => {
  return props.logo ? props.logo.thumb_url ?? props.logo.url : defaultProfileImg;
});
</script>

<template>
  <v-avatar :size="size">
    <v-img :src="src" />
  </v-avatar>
</template>

<style scoped></style>
