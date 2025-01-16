<template>
  <v-layout>
    <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Reader App</v-toolbar-title>

        <v-spacer></v-spacer>

        <template v-if="$vuetify.display.mdAndUp">
          <v-btn icon="mdi-magnify" variant="text"></v-btn>

          <v-btn icon="mdi-filter" variant="text"></v-btn>
        </template>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
        temporary>
        <v-list>
            <v-list-item link @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
        </v-list>
      </v-navigation-drawer>

    <v-main>
      <NuxtPage />
    </v-main>
  </v-layout>
</template>

<script setup>

import { ref, watch } from 'vue';

const drawer = ref(false)
const group = ref(null)
const { logout } = useAuth();
const loading = ref(false);

const handleLogout = async () => {
  //loading.value = true;
  await logout();
  navigateTo('/login');
};

watch(group, () => {
    drawer = false
  }
)
</script>

