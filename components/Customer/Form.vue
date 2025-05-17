<script setup lang="ts">
import { CustomerStore } from '@/stores/customer';
import { computed, onUpdated, ref } from 'vue';
import { useRouter } from 'vue-router';
const { $showSnackbar } = useNuxtApp();

const { validations } = useValidation();
const customerStore = CustomerStore();
const { accountNumberGenerated, generateAccountNumber, getCustomer } = useFetchCustomer();
const { brgys, getList: getBarangays } = useFetchBrgys();
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
  console.log(customerStore.customerForm);
  if (customerStore.customerForm.id) {
    getCustomer();
  } else {
    Object.keys(customerStore.customerForm).forEach((key) => {
      customerStore.customerForm[key] = '';
    });
  }
};
const router = useRouter();
const loading = ref(false);
const customerErrors = ref();

let rules = {
  first_name: {
    required: validations.required('First name'),
  },
  last_name: {
    required: validations.required('Last name'),
  },
};

if (props.isCreating) {
  // rules.password = {
  //   required: validations.required('Password'),
  //   minLength: validations.minLength('Password', 6),
  //   password: validations.password(),
  // };
}

//const v$ = useVuelidate(rules, customerStore.customerForm, { $autoDirty: true });
const handleSubmit = async () => {
  console.log(customerStore.customerForm);
  //if (!(await v$.value.$validate())) return;
  loading.value = true;
  const formData = new FormData();

  formData.append('account_number', customerStore.customerForm.account_number);
  formData.append('first_name', customerStore.customerForm.first_name);
  formData.append('mi', customerStore.customerForm.mi);
  formData.append('last_name', customerStore.customerForm.last_name);
  formData.append('address', customerStore.customerForm.address);
  formData.append(
    'brgy',
    customerStore.customerForm.brgy && customerStore.customerForm.brgy.length > 0 ? customerStore.customerForm.brgy : ''
  );
  formData.append('phone_number', customerStore.customerForm.phone_number);
  formData.append('application_type', customerStore.customerForm.application_type);
  formData.append('account_type', customerStore.customerForm.account_type);

  const { data, error } = await useApi(
    props.isCreating ? '/customers' : `/customers/${customerStore.customerForm.id}`,
    {
      method: props.isCreating ? 'POST' : 'PUT',
      body: props.isCreating ? formData : customerStore.customerForm,
    }
  );

  loading.value = false;
  console.log(data.value?.data?.id);

  if (data.value?.data?.id) {
    $showSnackbar('Customer Entry Successfully saved', 'success', 5000);
    router.push(`/customers/${data.value?.data?.id}`);
  }

  if (error.value) {
    customerErrors.value = error.value;

    return;
  }

  isEditing.value = false;
};

const errors = computed(() => {
  return Object.keys(customerStore.customerForm).reduce((prev, curr) => {
    prev[curr] = customerErrors.value?.data?.errors?.[curr]?.[0];

    return prev;
  }, {});
});

const options = { mask: '#### ### ###' };
const dobOption = { mask: '####-##-##' };

const isEditing = ref(false);
const { deleteLoading, showConfirmDelete, handleDelete } = useDeleteUser();

const backToList = () => {
  router.push('/customers');
};

onUpdated(() => {});

onMounted(async () => {
  await getBarangays();
  if (props.isCreating) {
    // get account number
    await generateAccountNumber();
    customerStore.customerForm.account_number = accountNumberGenerated.value;
  }
});
</script>

<template>
  <div>
    <v-card-title>
      <div class="d-flex">
        <span class="text-h6">{{ isCreating ? 'New Customer Entry' : 'Customer Information' }}</span>
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
                    label="Account No."
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="customerStore.customerForm.account_number"
                    :readonly="true"
                    :disabled="true"
                    :error-messages="errors.account_number"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    ref="fullNameRef"
                    label="First name"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="customerStore.customerForm.first_name"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.first_name"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    label="Middle Name"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="customerStore.customerForm.mi"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.mi"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    label="Last name"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="customerStore.customerForm.last_name"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.last_name"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters style="gap: 12px">
                <v-col>
                  <v-text-field
                    label="Address"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="customerStore.customerForm.address"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.address"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-select
                label="Barangay"
                variant="outlined"
                color="primary"
                class="mb-2"
                rounded="xl"
                :items="brgys"
                item-title="name"
                item-value="name"
                v-model="customerStore.customerForm.brgy"
                :error-messages="errors.brgy"
                :disabled="!isEditing && !isCreating"
              ></v-select>

              <v-text-field
                label="Phone Number"
                variant="outlined"
                color="primary"
                class="mb-2"
                rounded="xl"
                v-model="customerStore.customerForm.phone_number"
                :readonly="loading"
                :disabled="!isEditing && !isCreating"
                :error-messages="errors.phone_number"
              >
              </v-text-field>

              <v-select
                label="Application Type"
                variant="outlined"
                color="primary"
                class="mb-2"
                rounded="xl"
                item-title="title"
                item-value="value"
                :items="customerStore.applicationTypes"
                v-model="customerStore.customerForm.application_type"
                :error-messages="errors.application_type"
                :disabled="!isEditing && !isCreating"
              ></v-select>

              <v-select
                label="Account Type"
                variant="outlined"
                color="primary"
                class="mb-2"
                rounded="xl"
                item-title="title"
                item-value="value"
                :items="customerStore.accountTypes"
                v-model="customerStore.customerForm.account_type"
                :error-messages="errors.account_type"
                :disabled="!isEditing && !isCreating"
              ></v-select>
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
