import { defineStore } from 'pinia';
import { Customer } from '@/types/Customer';

export const CustomerStore = defineStore('customer', () => {

    const customerForm = ref(emptyCustomerForm());
    const applicationTypes = [
        {
            title: 'New',
            value: 'new'
        },
        {
            title: 'Recon',
            value: 'recon'
        },
        {
            title: 'Meter Separation',
            value: 'meter_separation'
        },
        {
            title: 'Others',
            value: 'others'
        },
    ]

    const accountTypes = [
        {
            title: 'Residence',
            value: 'residence'
        },
        {
            title: 'Commercial',
            value: 'commercial'
        },
        {
            title: 'Apartment',
            value: 'apartment'
        },
        {
            title: 'Market Stall',
            value: 'market_stall'
        },
        {
            title: 'Others',
            value: 'others'
        },
    ]

    const setCustomer = (data: Customer) => (customerForm.value = data);
    const getCustomer = computed(() => customerForm.value);
    const clearCustomer = () => (customerForm.value = emptyCustomerForm());

    function emptyCustomerForm() {
        return {
            account_number: '',
            first_name: '',
            last_name: '',
            mi: '',
            phone_number: '',
            address: '',
            brgy: null,
            account_type: null,
            application_type: null
        }
    }
    return { 
        accountTypes,
        applicationTypes,
        customerForm,
        getCustomer, 
        setCustomer, 
        clearCustomer 
    };
});
