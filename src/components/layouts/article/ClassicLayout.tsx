
import { Link } from "react-router-dom";
import { Star, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClassicLayoutProps {
  article: ArticleData;
}

export const ClassicLayout = ({ article }: ClassicLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', article.author_id)
          .single();
        
        if (!error && data) {
          setAuthorProfile(data);
        }
      }
    };

    fetchAuthorProfile();
  }, [article.author_id]);

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (authorProfile?.display_name) {
      return authorProfile.display_name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
    }
    return authorProfile?.email ? authorProfile.email.substring(0, 2).toUpperCase() : 'AU';
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        {article.featured_image && (
          <div className="aspect-[2/1] overflow-hidden rounded-xl mb-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div>
          {/* Article Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {article.type === "review" && article.review_details?.[0]?.overall_score && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="h-5 w-5 fill-current" />
                {article.review_details[0].overall_score.toFixed(1)}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            {authorProfile ? (
              <span className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <span>{authorProfile.display_name || authorProfile.email}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Author
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          {article.description && (
            <p className="text-xl text-gray-600 mb-8">
              {article.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        {/* Article Content */}
        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      </div>
    </article>
  );
};
