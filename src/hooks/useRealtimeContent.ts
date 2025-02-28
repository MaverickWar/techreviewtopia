
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
          
          // Instead of invalidating all content queries, only invalidate specific content
          // This prevents the form from losing content when navigating between tabs
          if (payload.new && payload.new.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['content', payload.new.id],
              refetchType: 'none' // Don't automatically refetch to prevent losing form state
            });
            
            // Also invalidate the content list query, but don't refetch immediately
            queryClient.invalidateQueries({
              queryKey: ['content'],
              exact: true,
              refetchType: 'none'
            });
          }
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
          
          // Only mark queries as stale without immediate refetching
          // This prevents the form from refreshing and losing state
          queryClient.invalidateQueries({ 
            queryKey: ['content'],
            refetchType: 'none'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['pages'],
            refetchType: 'none'
          });
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
          
          // For review details, only invalidate the content it's related to
          if (payload.new && payload.new.content_id) {
            queryClient.invalidateQueries({
              queryKey: ['content', payload.new.content_id],
              refetchType: 'none'
            });
            
            // Also mark the broader content queries as stale without refetching
            queryClient.invalidateQueries({
              queryKey: ['content'],
              exact: true,
              refetchType: 'none'
            });
          }
        }
      )
      .subscribe();

    // Cleanup function to remove the channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
