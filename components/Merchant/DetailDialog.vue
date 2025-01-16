<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { defaultHours, minimizeHoursErrorMessage, parseBusinessHours } from '@/utils/Merchant'

const { validations } = useValidation();
const emits = defineEmits(['changeAvatar'])
const props = withDefaults(
  defineProps<{
    open?: boolean;
    user?: object;
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
  phone_number: props.user?.phone_number,
  name: props.user?.business_information?.name,
  address: props.user?.business_information?.address,
  is_reward_system: props.user?.lock_reward_system ? false : true,
  reward_system: props.user?.reward_system?.type ? props.user?.reward_system?.type : 'STAMP_SYSTEM',
  redeem_amount: props.user?.reward_system?.redeem_amount,
  logo: null,
  business_hours: props.user?.business_information?.business_hours ? parseBusinessHours(props.user?.business_information?.business_hours): defaultHours()
});

Object.keys(form.value.business_hours).forEach(key => {
  form.value[`business_hours.${key}.from`] = null
  form.value[`business_hours.${key}.to`] = null
  form.value[`business_hours.${key}.availability`] = null
});

const resetFields = () => {
  // Object.keys(form.value).forEach((key) => {
  //   form.value[key] = props.user[key];
  // });

  // form.value.business_hours = defaultHours()
};

const loading = ref(false);
const userErrors = ref();

let rules = {
  name: {
    required: validations.required('Business Name'),
  },
  address: {
    required: validations.required('Business Address'),
  },
  phone_number: {
    required: validations.required('Phone number'),
  }
};

const v$ = useVuelidate(rules, form, { $autoDirty: true });
const handleUpdate = async () => {
  if (!(await v$.value.$validate())) return;
  loading.value = true;
  const formData = new FormData();
  formData.append('name', form.value.name)
  formData.append('address', form.value.address)
  formData.append('phone_number', form.value.phone_number)
  formData.append('lock_reward_system', (form.value.is_reward_system ? false : true))

  if (form.value.logo) {
    formData.append('logo', form.value.logo)
  }

  if (form.value.is_reward_system) {
    formData.append('reward_system', form.value.reward_system)
    formData.append('redeem_amount', form.value.redeem_amount ? form.value.redeem_amount : null)
  }
  
  Object.keys(form.value.business_hours).forEach(key => {
    formData.append(`business_hours[${key}][availability]`, form.value.business_hours[key].availability)
    formData.append(`business_hours[${key}][from]`, form.value.business_hours[key].from)
    formData.append(`business_hours[${key}][to]`, form.value.business_hours[key].to)
  });
  
  const { data, error } = await useApi(props.isCreating ? '/business' : `/business/${props.user.id}/update`, {
    method: 'POST',
    body: formData,
  })
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
  let tempErrors =  Object.keys(form.value).reduce((prev, curr) => {
    prev[curr] = v$.value[curr]?.$errors[0]?.$message || userErrors.value?.data?.errors?.[curr]?.[0];
    return prev;
  }, {});
  tempErrors = minimizeHoursErrorMessage(tempErrors)
  return tempErrors;
});

const options = { mask: '#### ### ###' };
const dobOption = { mask: '####-##-##' };

const showPassword = ref(false);
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const isEditing = ref(false);
const { deleteLoading, showConfirmDelete, handleDelete } = useDeleteUser();

const businessNameRef = ref();
watch([showDialog, isEditing], () => {
  if (!showDialog.value) {
    console.log('clear')

    if (!isEditing) {
      form.value.name = null
      form.value.business_hours = defaultHours()
      form.value.phone_number = null
      form.value.name = null
      form.value.address = null
      form.value.is_reward_system = true
      form.value.reward_system = 'STAMP_SYSTEM'
      form.value.redeem_amount = 0
      form.value.logo = null
      userErrors.value = null
    }
  }
  if (showDialog.value || isEditing.value) {
    setTimeout(() => {
      businessNameRef.value.focus();
    }, 300);
  }
});

const addedLogoFile = (file: File) => {
  form.value.logo = file
}
</script>

<template>
  <div>
    <v-dialog v-model="showDialog" persistent width="800">
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
          Add Merchant
        </v-btn>
        <v-btn v-else class="ma-1" icon="mdi-eye" color="primary" rounded="xl" flat size="x-small" v-bind="props" />
      </template>
      <v-card>
        <v-card-title>
          <div class="d-flex">
            <span class="text-h5">{{ isCreating ? 'Add new Merchant' : 'Merchant Profile' }}</span>
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
          <v-card-text class="pa-0">
            <v-container fluid>
              <v-alert type="error" v-if="error">User not found</v-alert>
              <MerchantUploadMerchantLogo :user="props.user" @change-avatar="addedLogoFile" />
              <v-card class="custom-card" flat>
                <v-card-text>
                  <v-row no-gutters style="gap: 12px">
                    <v-col class="pa-0">
                      <v-text-field
                        ref="businessNameRef"
                        label="Business Name"
                        variant="outlined"
                        color="primary"
                        class="mb-2"
                        rounded="xl"
                        v-model="form.name"
                        :readonly="loading"
                        :disabled="!isEditing && !isCreating"
                        :error-messages="errors.name"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters style="gap: 12px">
                    <v-col>
                      <v-text-field
                        label="Business Address"
                        variant="outlined"
                        color="primary"
                        class="mb-2"
                        rounded="xl"
                        v-model="form.address"
                        :readonly="loading"
                        :disabled="!isEditing && !isCreating"
                        :error-messages="errors.address"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters style="gap: 12px">
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
                  </v-row>

                  <v-row no-gutters style="gap: 12px">
                    <v-col cols="3">
                      <v-checkbox label="Reward System" v-model="form.is_reward_system" :disabled="!isEditing && !isCreating"></v-checkbox>
                    </v-col>
                    <v-col class="d-flex" cols="8" v-if="form.is_reward_system">
                        <v-col cols="6">
                           <v-select
                            label="System"
                            variant="outlined"
                            color="primary"
                            v-model="form.reward_system"
                            :items="['STAMP_SYSTEM', 'POINT_SYSTEM']"
                            :readonly="loading"
                            :disabled="!isEditing && !isCreating"
                          ></v-select>
                        </v-col>
                       <v-col cols="6">
                          <v-text-field
                            color="primary"
                            label="Redeem Amount"
                            variant="outlined"
                            v-model="form.redeem_amount"
                            :readonly="loading"
                            :disabled="!isEditing && !isCreating"
                            :error-messages="errors.redeem_amount"
                          >
                          </v-text-field>
                       </v-col>
                    </v-col>
                  </v-row>

                  <v-row no-gutters style="gap: 12px">
                    <v-card class="custom-card" flat width="100%">
                        <v-card-title>
                          <small>Business Hours</small>
                        </v-card-title>
                        <v-card-text style="gap: 12px">
                          <div class="d-flex flex-wrap" v-for="(schedule, index) in form.business_hours" :key="index">
                            <v-col class="pa-0" cols="3">
                              <v-checkbox :label="index" v-model="schedule.availability" :disabled="!isEditing && !isCreating" width="20"></v-checkbox>
                            </v-col>
                            <v-col class="pa-0"  cols="9">
                              <div class="d-flex flex-wrap">
                                  <v-text-field
                                    color="primary"
                                    variant="outlined"
                                    class="mr-2"
                                    v-model="schedule.from"
                                    :readonly="loading"
                                    :disabled="!isEditing && !isCreating"
                                    :error-messages="errors[`business_hours.${index}.from`]"
                                  >
                                  </v-text-field>
                                  <div class="separator">-</div>
                                  <v-text-field
                                    color="primary"
                                    variant="outlined"
                                    class="mr-2"
                                    v-model="schedule.to"
                                    :readonly="loading"
                                    :disabled="!isEditing && !isCreating"
                                    :error-messages="errors[`business_hours.${index}.to`]"
                                  >
                                  </v-text-field>
                              </div>
                            </v-col>
                          </div>
                        </v-card-text>
                    </v-card>
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
<style scoped>
.separator {
  height: auto;
  padding: 5px;
  margin-top: 3%;
  margin-right: 2%;
}

.v-text-field .v-input__control .v-input__slot {
  min-height: 0 !important;
  padding: 0 8px !important;
  margin-bottom: 2px !important;
  display: flex !important;
  align-items: center !important;
}
</style>