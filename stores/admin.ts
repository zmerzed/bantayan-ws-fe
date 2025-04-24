import { defineStore } from 'pinia';
import { Admin } from '@/types/Admin';

export const AdminStore = defineStore('admin', () => {

    const adminForm = ref(emptyAdminForm());
    const roles = [
        {
            title: 'Admin',
            value: 'ADMIN'
        },
        {
            title: 'Reader',
            value: 'READER'
        }
    ]

    const setAdmin = (data: Admin) => (adminForm.value = data);
    const getAdmin = computed(() => adminForm.value);
    const clearAdminForm = () => (adminForm.value = emptyAdminForm());

    function emptyAdminForm() {
        console.log('mmm')
        return {
            email: '',
            full_name: '',
            role: null,
            password: '',
        }
    }
    return { 
        roles,
        adminForm,
        getAdmin, 
        setAdmin, 
        clearAdminForm 
    };
});
