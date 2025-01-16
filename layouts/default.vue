<script setup lang="ts">
import logo from '@/assets/logo.png';
import { ref } from 'vue';
const drawer = ref(true);

const { logout } = useAuth();

const loading = ref(false);
const handleLogout = async () => {
  loading.value = true;
  await logout();
  navigateTo('/login');
};
</script>

<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list-item nav class="w-full text-center mt-5">
        <h3 class="font-title-3 text-center">WS</h3>
        <p class="font-body relative">Dashboard</p>
      </v-list-item>

      <v-list density="compact" nav :disabled="loading" class="pa-4">
        <v-list-item to="/" prepend-icon="mdi-home" title="Home" value="home"></v-list-item>
        <!-- <v-list-item to="/users" prepend-icon="mdi-account" title="Users" value="users"></v-list-item> -->
        <v-list-item to="/customers" prepend-icon="mdi-menu" title="Customers" value="customers"></v-list-item>

        <v-list-group value="settings" class="settings-list">
          <template v-slot:activator="{ props }">
            <v-list-item to="#" v-bind="props" prepend-icon="mdi-wrench" title="Settings"></v-list-item>
          </template>

          <!-- <v-list-item
            title="Version Control"
            prepend-icon="mdi-version"
            value="version-control"
            to="/version-control"
          ></v-list-item> -->
          <v-list-item
            title="Terms of Service"
            prepend-icon="mdi-file-document"
            value="terms-of-service"
            to="/terms-of-service"
          />
          <v-list-item
            title="Privacy Policy"
            prepend-icon="mdi-file-document-box"
            value="privacy-policy"
            to="/privacy-policy"
          ></v-list-item>
        </v-list-group>
        <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="Logout" value="logout"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <NuxtPage />
    </v-main>
  </v-layout>
</template>

<style lang="scss" scoped>
.settings-list .v-list-group__items .v-list-item {
  padding-inline-start: 32px !important;
}

.v-main {
  padding-left: 256px;
}
</style>
