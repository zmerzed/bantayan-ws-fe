
import { AdminStore } from '@/stores/admin';

export const useFetchAdmin = () => {
  const adminStore = AdminStore();
 
  const getAdmin = async (adminId) => {
    const { data } = await useApi(`/admins/${adminId}`, {
      method: 'GET',
      params: {},
    });
    adminStore.setAdmin(data.value.data)
  };

  return {
    getAdmin,
  };
};
