<script setup lang="ts">
import { SequenceStore } from '@/stores/sequence';
import { computed, onUpdated, ref } from 'vue';
import { useRouter } from 'vue-router';
const { $showSnackbar } = useNuxtApp();

const { validations } = useValidation();
const sequenceStore = SequenceStore();
const { getSequence } = useFetchSequence();

const brgyComp = useFetchBrgys();
const brgyList = ref([]);

const adminComp = useAdmins();
const adminPaginationOptions = computed(() => adminComp.paginationOptions.value);
const meta = computed(() => adminPaginationOptions.value.listMeta);
const adminList = computed(() => adminPaginationOptions.value.list);

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
  if (sequenceStore.id) {
    getSequence();
  } else {
    sequenceStore.clearSequenceForm();
  }
};
const router = useRouter();
const loading = ref(false);

let rules = {
  first_name: {
    required: validations.required('First name'),
  },
  last_name: {
    required: validations.required('Last name'),
  },
};

const handleSubmit = async () => {
  console.log(sequenceStore.form);
  //if (!(await v$.value.$validate())) return;
  loading.value = true;
  const formData = new FormData();

  //formData.append('full_name', adminStore.adminForm.number);
  //formData.append('email', adminStore.adminForm.email);
  //formData.append('password', adminStore.adminForm.password);
  //formData.append('role', adminStore.adminForm.role);

  const { data, error } = await useApi(props.isCreating ? '/sequences' : `/sequences/${sequenceStore.form.id}`, {
    method: props.isCreating ? 'POST' : 'PUT',
    body: props.isCreating ? formData : {reader: sequenceStore.form.admin_id},
  });

  loading.value = false;
  console.log(data.value?.data?.id);

  if (data.value?.data?.id) {
    $showSnackbar('Sequence Successfully saved', 'success', 5000);
    router.push(`/sequences/${data.value?.data?.id}`);
  }

  if (error.value) {
    errors.value = error.value;

    return;
  }

  isEditing.value = false;
};

const errors = computed(() => {
  return Object.keys(sequenceStore.form).reduce((prev, curr) => {
    prev[curr] = errors.value?.data?.errors?.[curr]?.[0];

    return prev;
  }, {});
});

const isEditing = ref(false);

const backToList = () => {
  router.push('/sequences');
};

onUpdated(() => {});

onMounted(async () => {
  // get barangays
  brgyList.value = await brgyComp.getList();
  // get readers (admin)
  await adminComp.getList({ per_page: 1000, "filter[role]": 'reader'});
});
</script>

<template>
  <div>
    <v-card-title>
      <div class="d-flex">
        <span class="text-h6">{{ isCreating ? 'New Sequence' : 'Sequence Information' }}</span>
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
                    ref="number"
                    label="Number"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="sequenceStore.form.number"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.number"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-select
                    label="Brgy"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    :items="brgyList"
                    item-title="name"
                    item-value="id"
                    :disabled="!isEditing && !isCreating"
                    v-model="sequenceStore.form.barangay_id"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-select
                    label="Readers"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    :items="adminList"
                    item-title="full_name"
                    item-value="id"
                    :disabled="!isEditing && !isCreating"
                    v-model="sequenceStore.form.admin_id"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
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
