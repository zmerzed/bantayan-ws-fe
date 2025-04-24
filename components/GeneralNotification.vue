<template>
  <v-snackbar
    v-model="visible"
    :color="color"
    :timeout="timeout"
    top
    right
  >
    {{ message }}
    <template #actions>
      <v-btn color="white" text @click="close">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from "vue";

// Reactive properties for the Snackbar
const visible = ref(false);
const message = ref("");
const color = ref("success");
const timeout = ref(3000);

// Method to show the Snackbar
const show = (msg, msgColor = "success", msgTimeout = 3000) => {
  message.value = msg;
  color.value = msgColor;
  timeout.value = msgTimeout;
  visible.value = true;
};

// Method to close the Snackbar
const close = () => {
  visible.value = false;
};

// Export the `show` function for external use
defineExpose({
  show,
});
</script>
