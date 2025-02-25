
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeContent = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content'
        },
        () => {
          // Invalidate and refetch content queries
          queryClient.invalidateQueries({ queryKey: ['content'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content'
        },
        () => {
          // Invalidate and refetch both content and page queries
          queryClient.invalidateQueries({ queryKey: ['content'] });
          queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

