
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeContent = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Use the channel API for Supabase Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content'
        },
        (payload) => {
          console.log('Content change received!', payload);
          // Invalidate the article query to refetch data
          queryClient.invalidateQueries({ queryKey: ['article'] });
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
