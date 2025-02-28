
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Star, MessageSquare, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

export const AdminDashboard = () => {
  const { data: statistics, isLoading, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
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
        return data.reduce((acc: Record<string, number>, curr) => {
          acc[curr.type] = curr.count;
          return acc;
        }, {});
      } else {
        // If no statistics data found, gather data from other tables
        console.log("No statistics found in statistics table. Calculating from source tables...");
        
        // Get counts from different tables in parallel for better performance
        const [
          usersResult,
          articlesResult,
          reviewsResult,
          commentsResult,
          viewsResult
        ] = await Promise.all([
          // Count active users from profiles
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          
          // Count published articles
          supabase.from('content')
            .select('id', { count: 'exact', head: true })
            .eq('type', 'article')
            .eq('status', 'published'),
          
          // Count published reviews
          supabase.from('content')
            .select('id', { count: 'exact', head: true })
            .eq('type', 'review')
            .eq('status', 'published'),
          
          // Placeholder for comments (assuming we might add this table later)
          Promise.resolve({ count: 0 }),
          
          // Placeholder for views (assuming we might add this metric later)
          Promise.resolve({ count: 0 })
        ]);

        // Return the calculated statistics
        return {
          active_users: usersResult.count || 0,
          total_articles: articlesResult.count || 0,
          total_reviews: reviewsResult.count || 0,
          total_comments: commentsResult.count || 0,
          total_views: viewsResult.count || 0
        };
      }
    },
    // Only refetch every 5 minutes since this data doesn't change very frequently
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
