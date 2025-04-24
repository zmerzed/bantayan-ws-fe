<template>
  <v-chip
    :color="statusColor"
    class="status-badge"
    :outlined="!isSolid"
  >
    <v-icon start>{{ statusIcon }}</v-icon>
    {{ statusText }}
  </v-chip>
</template>

<script>
export default {
  name: "Status",
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ["active", "pending", "closed"].includes(value),
    },
    isSolid: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    statusColor() {
      switch (this.status) {
        case "active":
          return "green";
        case "pending":
          return "grey";
        case "closed":
          return "red";
        default:
          return "grey";
      }
    },
    statusIcon() {
      switch (this.status) {
        case "online":
          return "mdi-check-circle";
        case "offline":
          return "mdi-minus-circle";
        case "busy":
          return "mdi-alert-circle";
        default:
          return "mdi-help-circle";
      }
    },
    statusText() {
      return this.status.charAt(0).toUpperCase() + this.status.slice(1);
    },
  },
};
</script>

<style scoped>
.status-badge {
  font-weight: bold;
  text-transform: capitalize;
}
</style>
