import { defineStore } from 'pinia';
import { Sequence } from '@/types/Sequence';

export const SequenceStore = defineStore('sequence', () => {

    const form = ref(emptySequenceForm());

    const setSequence = (data: Sequence) => (form.value = data);
    const getSequence = computed(() => form.value);
    const clearSequenceForm = () => (form.value = emptySequenceForm());

    function emptySequenceForm() {
        return {
            number: '',
            barangay_id: '',
            id_readers: []
        }
    }
    return { 
        form,
        getSequence, 
        setSequence, 
        clearSequenceForm 
    };
});
