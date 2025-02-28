
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // First, get the current total_views count
        const { data, error } = await supabase
          .from('statistics')
          .select('count')
          .eq('type', 'total_views')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching view count:', error);
          return;
        }

        const currentCount = data?.count || 0;
        const newCount = currentCount + 1;

        // Update the statistics table with the new count
        const { error: updateError } = await supabase
          .from('statistics')
          .upsert(
            { 
              type: 'total_views', 
              count: newCount, 
              last_updated: new Date().toISOString() 
            },
            { 
              onConflict: 'type',
              ignoreDuplicates: false
            }
          );

        if (updateError) {
          console.error('Error updating view count:', updateError);
        }

        console.log(`Page view recorded for: ${location.pathname}`);
      } catch (err) {
        console.error('Error in view tracking:', err);
      }
    };

    // Only track views on the frontend (non-admin) pages
    if (!location.pathname.startsWith('/admin')) {
      trackPageView();
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};
