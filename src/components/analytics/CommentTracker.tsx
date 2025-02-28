
import { supabase } from '@/integrations/supabase/client';

// This function will be called after a new comment is added
export const trackNewComment = async () => {
  try {
    // First, get the current total_comments count
    const { data, error } = await supabase
      .from('statistics')
      .select('count')
      .eq('type', 'total_comments')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching comment count:', error);
      return;
    }

    const currentCount = data?.count || 0;
    const newCount = currentCount + 1;

    // Update the statistics table with the new count
    const { error: updateError } = await supabase
      .from('statistics')
      .upsert(
        { 
          type: 'total_comments', 
          count: newCount, 
          last_updated: new Date().toISOString() 
        },
        { 
          onConflict: 'type',
          ignoreDuplicates: false
        }
      );

    if (updateError) {
      console.error('Error updating comment count:', updateError);
    }

    console.log('Comment count updated');
  } catch (err) {
    console.error('Error in comment tracking:', err);
  }
};
