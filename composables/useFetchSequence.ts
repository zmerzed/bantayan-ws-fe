
import { SequenceStore } from '@/stores/sequence';

export const useFetchSequence = () => {
  const route = useRoute();
  const sequenceStore = SequenceStore();

  const getSequence = async () => {
    const { data } = await useApi(`/sequences/${route.params.id}`, {
      method: 'GET',
      params: {},
    });
    sequenceStore.setSequence(data.value.data)
  };

  return {
    getSequence,
  };
};
