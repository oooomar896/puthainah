import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * useRealtimeSync Hook
 * Listen for realtime changes on a Supabase table and trigger a callback.
 * 
 * @param {string} table - Table name to subscribe to
 * @param {string} filter - Postgres filter string (e.g. "id=eq.123")
 * @param {function} onUpdate - Callback function called on any change
 */
export const useRealtimeSync = (table, filter, onUpdate) => {
    useEffect(() => {
        if (!table || !onUpdate) return;

        const channel = supabase
            .channel(`realtime_${table}_${filter?.replace(/[^a-zA-Z0-9]/g, '_') || 'all'}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: table,
                    filter: filter,
                },
                (payload) => {
                    onUpdate(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Realtime: Subscribed to ${table} with filter ${filter}`);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, filter, onUpdate]);
};
