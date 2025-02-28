import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeContent = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .from('content')
      .on('*', (payload) => {
        console.log('Change received!', payload);
        // Invalidate the article query to refetch data
        queryClient.invalidateQueries(['article']);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [queryClient]);
};
