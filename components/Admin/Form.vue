<script setup lang="ts">
import { AdminStore } from '@/stores/admin';
import { computed, onUpdated, ref } from 'vue';
import { useRouter } from 'vue-router';
const { $showSnackbar } = useNuxtApp();

const { validations } = useValidation();
const adminStore = AdminStore();
const { getAdmin } = useFetchAdmin();
const props = withDefaults(
  defineProps<{
    open?: boolean;
    isCreating?: boolean;
    error?: string;
  }>(),
  {
    open: false,
    isCreating: false,
    error: '',
  }
);
const resetFields = () => {
  console.log('admin form', adminForm);
  if (adminForm.id) {
    getAdmin();
  } else {
    Object.keys(adminForm).forEach((key) => {
      adminForm[key] = '';
    });
  }
};
const router = useRouter();
const loading = ref(false);
const adminErrors = ref();

let rules = {
  first_name: {
    required: validations.required('First name'),
  },
  last_name: {
    required: validations.required('Last name'),
  },
};

const handleSubmit = async () => {
  console.log(adminStore.adminForm);
  //if (!(await v$.value.$validate())) return;
  loading.value = true;
  const formData = new FormData();

  formData.append('full_name', adminStore.adminForm.full_name);
  formData.append('email', adminStore.adminForm.email);
  formData.append('password', adminStore.adminForm.password);
  formData.append('role', adminStore.adminForm.role);

  const { data, error } = await useApi(props.isCreating ? '/admins' : `/admins/${adminStore.adminForm.id}`, {
    method: props.isCreating ? 'POST' : 'PUT',
    body: props.isCreating ? formData : adminStore.adminForm,
  });

  loading.value = false;
  console.log(data.value?.data?.id);

  if (data.value?.data?.id) {
    $showSnackbar('User Entry Successfully saved', 'success', 5000);
    router.push(`/users/${data.value?.data?.id}`);
  }

  if (error.value) {
    adminErrors.value = error.value;

    return;
  }

  isEditing.value = false;
};

const errors = computed(() => {
  return Object.keys(adminStore.adminForm).reduce((prev, curr) => {
    prev[curr] = adminErrors.value?.data?.errors?.[curr]?.[0];

    return prev;
  }, {});
});

const options = { mask: '#### ### ###' };
const dobOption = { mask: '####-##-##' };

const isEditing = ref(false);
const { deleteLoading, showConfirmDelete, handleDelete } = useDeleteUser();

const backToList = () => {
  router.push('/users');
};

onUpdated(() => {});

onMounted(async () => {
  console.log('mount form');

  if (props.isCreating) {
    // get account number
    //clearAdminForm()
  }
});
</script>

<template>
  <div>
    <v-card-title>
      <div class="d-flex">
        <span class="text-h6">{{ isCreating ? 'New User Entry' : 'User Information' }}</span>
        <v-spacer />
      </div>
    </v-card-title>
    <v-form @submit.prevent="handleSubmit">
      <v-card-text>
        <v-container fluid>
          <v-card class="custom-card" flat>
            <v-card-text>
              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    ref="fullNameRef"
                    label="Full Name"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="adminStore.adminForm.full_name"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.full_name"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    ref="email"
                    label="Email"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="adminStore.adminForm.email"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.email"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    ref="password"
                    label="Password"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="adminStore.adminForm.password"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.password"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-select
                    label="Role"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    :items="adminStore.roles"
                    item-title="title"
                    item-value="value"
                    v-model="adminStore.adminForm.role"
                    :error-messages="errors.role"
                    :disabled="!isEditing && !isCreating"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <ConfirmDialog
            v-model="showConfirmDelete"
            title="Delete User"
            description="This action cannot be undone"
            :loading="deleteLoading"
            @confirm="emits('load-page', $event)"
            @cancel="showConfirmDelete = false"
          />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn
          prepend-icon="mdi-pencil"
          rounded="xl"
          elevation="0"
          color="tertiary"
          :loading="loading"
          v-if="!isEditing && !isCreating"
          @click="isEditing = !isEditing"
        >
          Edit
        </v-btn>
        <v-btn
          class="ml-auto"
          prepend-icon="mdi-delete"
          rounded="xl"
          elevation="0"
          color="error"
          :loading="loading"
          v-if="!isEditing && !isCreating"
          @click="showConfirmDelete = true"
        >
          Delete account
        </v-btn>
        <v-btn
          v-if="isEditing && !isCreating"
          rounded="xl"
          elevation="0"
          :disabled="loading"
          prepend-icon="mdi-cancel"
          @click="
            isEditing = !isEditing;
            resetFields();
          "
          class="mr-2"
        >
          Cancel
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn color="blue-darken-1" variant="text" @click="backToList"> Close </v-btn>
        <v-btn
          v-if="isEditing && !isCreating"
          rounded="xl"
          elevation="0"
          color="primary"
          type="submit"
          :loading="loading"
          prepend-icon="mdi-content-save"
        >
          Save
        </v-btn>
        <v-btn
          v-if="isCreating"
          rounded="xl"
          elevation="0"
          color="primary"
          type="submit"
          :loading="loading"
          prepend-icon="mdi-account-plus"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-form>
  </div>
</template>
