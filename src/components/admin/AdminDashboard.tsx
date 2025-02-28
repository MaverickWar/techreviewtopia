
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Star, MessageSquare, Eye } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

export const AdminDashboard = () => {
  const { data: statistics } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('statistics')
        .select('*');
      
      if (error) throw error;
      return data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.type] = curr.count;
        return acc;
      }, {});
    }
  });

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
                <h2 className="text-3xl font-bold mt-2">
                  {stat.value.toLocaleString()}
                </h2>
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
