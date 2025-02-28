
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ViewTracker = () => {
  const location = useLocation();
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const trackPageView = async () => {
      if (isTracking) return; // Prevent duplicate tracking
      
      setIsTracking(true);
      
      try {
        // First, get the current total_views count
        const { data, error } = await supabase
          .from('statistics')
          .select('count')
          .eq('type', 'total_views')
          .maybeSingle();

        if (error) {
          console.error('Error fetching view count:', error);
          setIsTracking(false);
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
              onConflict: 'type' 
            }
          );

        if (updateError) {
          console.error('Error updating view count:', updateError);
        } else {
          console.log(`Page view recorded for: ${location.pathname}`);
        }
      } catch (err) {
        console.error('Error in view tracking:', err);
      } finally {
        setIsTracking(false);
      }
    };

    // Only track views on the frontend (non-admin) pages
    if (!location.pathname.startsWith('/admin')) {
      trackPageView();
    }
  }, [location.pathname, isTracking]);

  return null; // This component doesn't render anything
};
