import { ref } from 'vue';

export const useFetchBrgys = () => {
    const brgys = ref([])

    const getList = async () => {
        const { data } = await useApi(`/barangays`, {
        method: 'GET',
        params: {},
        });
        brgys.value = data.value.data
        return brgys.value
    };

    return {
        brgys,
        getList,
    };
};
