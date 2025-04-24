import { Admin } from "~/types/Admin";
import { ListMeta } from "~/types/DataTable";
import ApiError from "~/types/ApiError";

export const useAdmins = () => {

    const isInfiniteScroll = ref(false)

    const fetching = ref(false)

    const paginationOptions = ref<{
        list: Array<Admin>,
        listMeta: ListMeta
    }
    >({
        list: [],
        listMeta: {
            current_page: 0,
            last_page: 0,
            from: 0,
            to: 0,
            per_page: 10,
            total: 0,
        },
    })

    function appendRows(rows: Array<Admin>) {
        useEach(rows, (row: Admin) => {
            const exist = useFind(paginationOptions.value.list, {id: row.id});
            if (!exist) {
                paginationOptions.value.list.push(row);
            }
        });
    }

    async function getList(
        options: {
            per_page: number;
            page: number;
            sort?: string;
        } = {
            per_page: 5,
            page: 1,
            sort: '-created_at'
        },
        filters: object = {}
    ) {
        try {
            let computedFilters = Object.entries(filters).reduce((newObject: any, [key, value]) => {
                newObject[`filter[${key}]`] = value;
                return newObject;
            }, {});

            fetching.value = true;
            const {data, error} = await useApi('/admins', {
                method: 'GET',
                params: {
                    ...options,
                    ...computedFilters,
                },
            });

            if (isInfiniteScroll.value) {
                appendRows(data.value?.data as Array<Admin>)
            } else {
                paginationOptions.value.list = data.value?.data as Array<Admin>
            }
            paginationOptions.value.listMeta = data.value?.meta as ListMeta

            if (error.value) {
                throw new ApiError(error.value);
            }
            return data;
        } catch (error) {
            throw error;
        } finally {
            fetching.value = false
        }
    }

    return {
        getList,
        paginationOptions,
        fetching,
        isInfiniteScroll
    }
}