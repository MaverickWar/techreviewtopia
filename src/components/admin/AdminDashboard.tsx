
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Star, MessageSquare, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

export const AdminDashboard = () => {
  const { data: statistics, isLoading, error, refetch } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      console.log("Fetching statistics...");
      try {
        // First, try to get statistics from the statistics table
        const { data, error } = await supabase
          .from('statistics')
          .select('*');
        
        if (error) {
          console.error("Error fetching statistics:", error);
          throw error;
        }

        // If we have data, transform it into a key-value object
        if (data && data.length > 0) {
          console.log("Using statistics from statistics table:", data);
          return data.reduce((acc: Record<string, number>, curr) => {
            acc[curr.type] = curr.count;
            return acc;
          }, {});
        } else {
          // If no statistics data found, gather data from other tables
          console.log("No statistics found in statistics table. Calculating from source tables...");
          
          // For users, we need to get all profiles
          const { count: usersCount, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          
          if (usersError) {
            console.error("Error counting users:", usersError);
          }
          
          // For articles, we count published articles
          const { count: articlesCount, error: articlesError } = await supabase
            .from('content')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'article')
            .eq('status', 'published');
          
          if (articlesError) {
            console.error("Error counting articles:", articlesError);
          }
          
          // For reviews, we count published reviews
          const { count: reviewsCount, error: reviewsError } = await supabase
            .from('content')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'review')
            .eq('status', 'published');
          
          if (reviewsError) {
            console.error("Error counting reviews:", reviewsError);
          }
          
          // Log the results for debugging
          console.log("Users count:", usersCount);
          console.log("Articles count:", articlesCount);
          console.log("Reviews count:", reviewsCount);
          
          // Calculate the stats
          const stats = {
            active_users: usersCount || 0,
            total_articles: articlesCount || 0,
            total_reviews: reviewsCount || 0,
            total_comments: 0, // Placeholder until we implement comments
            total_views: 0     // Placeholder until we implement view tracking
          };
          
          console.log("Calculated statistics:", stats);
          
          // Store the calculated statistics in the statistics table for future use
          try {
            for (const [type, count] of Object.entries(stats)) {
              const { error: upsertError } = await supabase
                .from('statistics')
                .upsert(
                  { 
                    type, 
                    count,
                    last_updated: new Date().toISOString() 
                  },
                  { 
                    onConflict: 'type'
                  }
                );
              
              if (upsertError) {
                console.error(`Error storing ${type} statistic:`, upsertError);
              }
            }
          } catch (storeError) {
            console.error("Error storing statistics:", storeError);
            // Even if storing fails, return the calculated stats
          }
          
          return stats;
        }
      } catch (err) {
        console.error("Error calculating statistics:", err);
        // Return empty stats object in case of error to prevent UI crashes
        return {
          active_users: 0,
          total_articles: 0,
          total_reviews: 0,
          total_comments: 0,
          total_views: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Force a refetch once when component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Prepare the stats cards with real data or zeros if not available
  const stats: StatCard[] = [
    {
      title: "Active Users",
      value: statistics?.active_users || 0,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      description: "Total active users on the platform"
    },
    {
      title: "Articles",
      value: statistics?.total_articles || 0,
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      description: "Published articles"
    },
    {
      title: "Reviews",
      value: statistics?.total_reviews || 0,
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      description: "Published reviews"
    },
    {
      title: "Comments",
      value: statistics?.total_comments || 0,
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      description: "User comments"
    },
    {
      title: "Total Views",
      value: statistics?.total_views || 0,
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      description: "Total page views"
    }
  ];

  if (error) {
    console.error("Error in dashboard stats:", error);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-24 mt-2" />
                ) : (
                  <h2 className="text-3xl font-bold mt-2">
                    {stat.value.toLocaleString()}
                  </h2>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </div>
              <div className="p-3 bg-background/10 rounded-full">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
