
import { Link } from "react-router-dom";
import { Star, Calendar, User, BookOpen, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MagazineLayoutProps {
  article: ArticleData;
}

export const MagazineLayout = ({ article }: MagazineLayoutProps) => {
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
    <article className="max-w-5xl mx-auto">
      {/* Hero Banner - adjusted height and padding */}
      <div className="relative h-[70vh] min-h-[500px] w-full mb-8">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Adjusted padding and positioning to prevent title from being cut off */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-20">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                {article.description}
              </p>
            )}
            
            {/* Article metadata */}
            <div className="flex items-center gap-3 text-white/90 mb-8 mt-4 text-sm">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-white/80" />
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span className="text-xs md:text-sm">8 min read</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Author Card */}
        {authorProfile && (
          <Card className="mb-8 overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200 shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center p-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <div className="mt-3 sm:mt-0 sm:ml-4 text-center sm:text-left">
                  <div className="font-medium text-gray-900">{authorProfile.display_name || authorProfile.email}</div>
                  <div className="text-sm text-gray-500">
                    {authorProfile.bio || "Contributing Writer"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Share buttons */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      
        {/* Main Content with pull quotes */}
        <div className="prose prose-lg max-w-none">
          {article.type === "review" && article.review_details?.[0]?.youtube_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <iframe
                src={article.review_details[0].youtube_url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </div>
      </div>
    </article>
  );
};
