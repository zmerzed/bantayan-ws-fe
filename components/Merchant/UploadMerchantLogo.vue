<script setup lang="ts">
import uploadProfile from '@/assets/img/upload-profile-placeholder.svg';
import dataURLtoFile from '@/services/data-uri-to-file';
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const emits = defineEmits(['changeAvatar']);

const props = defineProps<{
  user?: {
    id?: number;
    avatar_permanent_url?: string;
    avatar?: Object;
  };
}>();

const AvatarCropper = defineAsyncComponent(() => import('@/components/AvatarCropper.vue'));
const avatar = ref<{ image: ArrayBuffer | null | undefined | string; file: File | null }>({ image: null, file: null });
const avatarCropperRef = ref();
const avatarCropperInput = ref();
const loading = ref(false);

const parseImage = (event: MouseEvent, type: string) => {
  // Reference to the DOM input element
  const input = event.target as HTMLInputElement;
  console.log('parseImage')
  // Ensure that you have a file before attempting to read it
  if (input.files && input.files[0]) {
    avatar.value.file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      avatar.value.image = e.target?.result;
    };
    reader.readAsDataURL(input.files[0]);

    emits('changeAvatar', input.files[0]);
  }
};

const userAvatar = ref(props.user?.avatar?.url || uploadProfile);
const handleUpload = async (type: 'avatar' | 'banner') => {
  if (avatar.value.file) {
    loading.value = true;
    const file = dataURLtoFile(
      avatarCropperRef.value.getResult().canvas.toDataURL('image/*'),
      avatar.value?.file.name,
      avatar.value?.file.lastModified
    );

    const form = new FormData();
    form.set('avatar', file);

    const { data, error } = await useApi(`/users/${props.user.id}/avatar`, {
      method: 'POST',
      body: form,
    });
    loading.value = false;

    if (error.value) {
      console.error(error);
      return;
    } else {
      const resData = data.value?.data;
      userAvatar.value = resData.url;
      emits('load-page');
    }

    avatar.value = { image: null, file: null };
  }
};

const cancel = () => {
    console.log('cancel', avatar.value.image)
    avatar.value.image = null
    //avatar.image.value = null
    emits('changeAvatar', null);
}
</script>

<template>
  <v-card flat class="mb-4">
    <v-card-text>
      <v-form>
        <Cropper v-if="avatar.image" ref="avatarCropperRef" :src="avatar.image" :stencil-component="AvatarCropper" />
        <label class="d-flex justify-center my-2 image-uploader" v-else>
          <v-avatar :rounded="props.user?.avatar ? 100 : 0" size="136px">
            <v-img class="rounded" :src="userAvatar" />
          </v-avatar>
          <input ref="avatarCropperInput" type="file" accept="image/*" hidden @change="parseImage" />
        </label>
        <v-row justify="center" align="center">
          <v-btn flat color="primary" class="mt-6 font-weight-bold" v-if="avatar.image" @click.prevent="cancel" :loading="loading">
            Cancel
          </v-btn>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
.image-uploader {
  cursor: pointer;
}
</style>
