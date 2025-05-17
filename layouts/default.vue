<script setup lang="ts">
import { ref } from 'vue';
const drawer = ref(true);

const { logout } = useAuth();

const loading = ref(false);
const handleLogout = async () => {
  loading.value = true;
  await logout();
  navigateTo('/login');
};

// Snackbar reference for global use
const snackbar = ref(null);

// Make the `show` method globally accessible using Nuxt's global state
useNuxtApp().$showSnackbar = (msg, color = 'success', timeout = 3000) => {
  snackbar.value?.show(msg, color, timeout);
};
</script>

<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list-item nav class="w-full text-center mt-5">
        <h3 class="font-title-3 text-center">WS</h3>
        <p class="font-body relative">Admin Dashboard</p>
      </v-list-item>

      <v-list density="compact" nav :disabled="loading" class="pa-4">
        <v-list-item to="/" prepend-icon="mdi-home" title="Home" value="home"></v-list-item>

        <v-list-group value="customers" class="customers-list">
          <template v-slot:activator="{ props }">
            <v-list-item to="#" v-bind="props" prepend-icon="mdi-menu" title="Customers"></v-list-item>
          </template>

          <!-- <v-list-item
            title="Version Control"
            prepend-icon="mdi-version"
            value="version-control"
            to="/version-control"
          ></v-list-item> -->
          <v-list-item title="List" value="customers-list" to="/customers" />
          <v-list-item title="New Entry" value="customers-new-entry" to="/customers/new"></v-list-item>
        </v-list-group>

        <v-list-group value="users" class="users-list">
          <template v-slot:activator="{ props }">
            <v-list-item to="#" v-bind="props" prepend-icon="mdi-human-male-female" title="Users"></v-list-item>
          </template>
          <v-list-item title="List" value="users-list" to="/users" />
          <v-list-item title="New Entry" value="users-new-entry" to="/users/new"></v-list-item>
        </v-list-group>

        <v-list-group value="sequences" class="sequences">
          <template v-slot:activator="{ props }">
            <v-list-item to="#" v-bind="props" prepend-icon="mdi-stairs" title="Sequences"></v-list-item>
          </template>
          <v-list-item title="List" value="sequence-list" to="/sequences" />
          <v-list-item title="New Sequence" value="sequence-new-entry" to="/sequences/new"></v-list-item>
        </v-list-group>

        <v-list-group value="readings" class="readings">
          <template v-slot:activator="{ props }">
            <v-list-item to="#" v-bind="props" prepend-icon="mdi-read" title="Readings"></v-list-item>
          </template>
          <v-list-item title="Generate" value="generate-readings" to="/readings" />
        </v-list-group>

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
      <GeneralNotification ref="snackbar" />
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
