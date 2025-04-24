
import { CustomerStore } from '@/stores/customer';

export const useFetchCustomer = () => {
  const route = useRoute();
  const customerStore = CustomerStore();
  const accountNumberGenerated = ref(null);

  const getCustomer = async () => {
    const { data } = await useApi(`/customers/${route.params.id}`, {
      method: 'GET',
      params: {},
    });
    customerStore.setCustomer(data.value.data)
  };

  const generateAccountNumber = async () => {
    const { data } = await useApi(`/customer/generate-account-no`, {
      method: 'GET',
      params: {},
    });
    accountNumberGenerated.value = data.value.data.account_number
  };

  return {
    accountNumberGenerated,
    generateAccountNumber,
    getCustomer,
  };
};
