
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeContent = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up real-time channel for content updates
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
          console.log('Content change detected:', payload);
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
        (payload) => {
          console.log('Page content change detected:', payload);
          // Invalidate and refetch both content and page queries
          queryClient.invalidateQueries({ queryKey: ['content'] });
          queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_details'
        },
        (payload) => {
          console.log('Review details change detected:', payload);
          // Invalidate content queries when review details change
          queryClient.invalidateQueries({ queryKey: ['content'] });
        }
      )
      .subscribe();

    // Cleanup function to remove the channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
