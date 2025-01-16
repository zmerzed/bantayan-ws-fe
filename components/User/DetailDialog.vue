<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
const { validations } = useValidation();

// const emits = defineEmits<{
//   (e: 'load-page'): void;
// }>();
const emits = defineEmits(['changeAvatar', 'load-page'])

const props = withDefaults(
  defineProps<{
    open?: boolean;
    user?: {
      id?: number;
      first_name: string;
      last_name: string,
      email: string;
      type: string;
      birthdate: string;
      phone_number: string;
    };
    isCreating?: boolean;
    error?: string;
  }>(),
  {
    open: false,
    isCreating: false,
    error: '',
  }
);

const showDialog = ref(false);

const form = ref({
  first_name: props.user?.first_name,
  last_name: props.user?.last_name,
  email: props.user?.email,
  password: '',
  type: props.user?.type,
  birthdate: props.user?.birthdate ? props.user.birthdate : '',
  phone_number: props.user?.phone_number
});

const resetFields = () => {
  Object.keys(form.value).forEach((key) => {
    form.value[key] = props.user[key];
  });
};

const loading = ref(false);
const userErrors = ref();

let rules = {
  first_name: {
    required: validations.required('First name'),
  },
  last_name: {
    required: validations.required('Last name'),
  },
  email: {
    required: validations.required('Email'),
    email: validations.email(),
  },
  password: {},
  birthdate: {
    required: validations.required('Date of birth'),
  },
  phone_number: {
    required: validations.required('Phone Number'),
  },
};
if (props.isCreating) {
  // rules.password = {
  //   required: validations.required('Password'),
  //   minLength: validations.minLength('Password', 6),
  //   password: validations.password(),
  // };
}

const v$ = useVuelidate(rules, form, { $autoDirty: true });
const handleUpdate = async () => {
  if (!(await v$.value.$validate())) return;
  loading.value = true;
  const formData = new FormData();
  formData.append('first_name', form.value.first_name)
  formData.append('last_name', form.value.last_name)
  formData.append('email', form.value.email)
  formData.append('phone_number', form.value.phone_number)
  formData.append('password', form.value.password)
  formData.append('birthdate', form.value.birthdate)

  if (form.value.avatar) {
    formData.append('avatar', form.value.avatar)
  }

  const { data, error } = await useApi(props.isCreating ? '/users' : `/users/${props.user.id}/update`, {
    method: 'POST',
    body: formData,
  });

  loading.value = false;

  if (error.value) {
    userErrors.value = error.value;

    return;
  } else {
    emits('load-page');
  }

  if (props.isCreating) {
    showDialog.value = false;
  }

  isEditing.value = false;
};

const errors = computed(() => {
  return Object.keys(form.value).reduce((prev, curr) => {
    prev[curr] = v$.value[curr]?.$errors[0]?.$message || userErrors.value?.data?.errors?.[curr]?.[0];

    return prev;
  }, {});
});

const options = { mask: '#### ### ###' };
const dobOption = { mask: '####-##-##' };

const showPassword = ref(false);
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const isEditing = ref(false);
const { deleteLoading, showConfirmDelete, handleDelete } = useDeleteUser();

const fullNameRef = ref();
watch([showDialog, isEditing], () => {
  if (showDialog.value || isEditing.value) {
    setTimeout(() => {
      fullNameRef.value.focus();
    }, 300);
  }
});

const addedLogoFile = (file: File) => {
  console.log('file', file)
  form.value.avatar = file
}
</script>

<template>
  <div>
    <v-dialog v-model="showDialog" persistent width="600">
      <template v-slot:activator="{ props }">
        <v-btn
          v-if="isCreating"
          prepend-icon="mdi-account-plus"
          rounded="md"
          elevation="0"
          color="primary"
          size="large"
          v-bind="props"
        >
          Add User
        </v-btn>
        <v-btn v-else class="ma-1" icon="mdi-eye" color="primary" rounded="xl" flat size="x-small" v-bind="props" />
      </template>
      <v-card>
        <v-card-title>
          <div class="d-flex">
            <span class="text-h5">{{ isCreating ? 'Add new User' : 'Merchant Profile' }}</span>
            <v-spacer />
            <v-btn
              class="ma-1"
              icon="mdi-close"
              color="grey"
              rounded="xl"
              flat
              size="x-small"
              @click="showDialog = false"
            />
          </div>
        </v-card-title>
        <v-form @submit.prevent="handleUpdate">
          <v-card-text>
            <v-container fluid>
              <v-alert type="error" v-if="error">User not found</v-alert>

              <UserUploadProfilePicture :user="props.user" @load-page="emits('load-page')"  @change-avatar="addedLogoFile"/>

              <v-card class="custom-card" flat>
                <v-card-text>
                  <v-row no-gutters style="gap: 12px">
                    <v-col>
                      <v-text-field
                        ref="fullNameRef"
                        label="First name"
                        variant="outlined"
                        color="primary"
                        class="mb-2"
                        rounded="xl"
                        v-model="form.first_name"
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
                        label="Last name"
                        variant="outlined"
                        color="primary"
                        class="mb-2"
                        rounded="xl"
                        v-model="form.last_name"
                        :readonly="loading"
                        :disabled="!isEditing && !isCreating"
                        :error-messages="errors.last_name"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-text-field
                    label="Email address"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    :autofocus="false"
                    v-model="form.email"
                    :readonly="!isCreating"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.email"
                  >
                  </v-text-field>

                  <v-text-field
                    ref="passwordRef"
                    label="Password"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    :error-messages="errors.password"
                    :readonly="loading"
                    autocomplete="current-password"
                    v-if="isCreating"
                  >
                    <template #append-inner>
                      <v-icon @click="togglePasswordVisibility">
                        {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
                      </v-icon>
                    </template>
                  </v-text-field>

                  <v-text-field
                    label="Date of Birth"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="form.birthdate"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.birthdate"
                    v-maska:[dobOption]
                  >
                  </v-text-field>

                  <v-text-field
                    label="Phone Number"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    rounded="xl"
                    v-model="form.phone_number"
                    :readonly="loading"
                    :disabled="!isEditing && !isCreating"
                    :error-messages="errors.phone_number"
                  >
                  </v-text-field>
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

            <v-btn color="blue-darken-1" variant="text" @click="showDialog = false"> Close </v-btn>
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
      </v-card>
    </v-dialog>
  </div>
</template>
