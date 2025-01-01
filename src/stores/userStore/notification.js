import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { v4 as uuidv4 } from 'uuid';

export const useNotice = defineStore('notice', () => {

    const addNotice = async (sender_id, recipient_id, message, notice_type) => {
        console.log('addNotice', sender_id, recipient_id, message);
        const currentData = await supabase
            .from('users')
            .select('notices')
            .eq('id', recipient_id)
            .single();

        const updatedNotices = currentData.length > 0 ? [...currentData[0].notices, { id: uuidv4(), sender_id, recipient_id, message, notice_type }] : [{ id: uuidv4(), sender_id, recipient_id, message, notice_type }];

        const { data, error } = await supabase
            .from('users')
            .update({ notices: updatedNotices })
            .eq('id', recipient_id);
    }

    const getNotices = async (id_user) => {
        const { data, error } = await supabase
            .from('users')
            .select('notices')
            .eq('id', id_user)
            .single();
        return data?.notices || [];
    }

    const removeNotice = async (id_user, id_notice) => {
        const { data:currentData} = await supabase
            .from('users')
            .select('notices')
            .eq('id', id_user)
            .single();
        const updatedNotices = currentData.notices.filter(notice => notice.id !== id_notice);

        const { data, error } = await supabase
            .from('users')
            .update({ notices: updatedNotices })
            .eq('id', id_user);

    }

    const removeSentNotice = async (id_recipient, id_sender) => {
        const { data:currentData} = await supabase
            .from('users')
            .select('notices')
            .eq('id', id_recipient)
            .single();
        const updatedNotices = currentData.notices.filter(notice => notice.notice_type !== 'sentFriend' && notice.sender_id !== id_sender);

        const { data, error } = await supabase
            .from('users')
            .update({ notices: updatedNotices })
            .eq('id', id_recipient);
    }

    return { addNotice, getNotices, removeNotice, removeSentNotice };
});
