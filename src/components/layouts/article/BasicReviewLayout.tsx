
import { Star, Calendar, User, Check, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AwardBanner } from "./AwardBanner";

interface BasicReviewLayoutProps {
  article: ArticleData;
}

export const BasicReviewLayout = ({ article }: BasicReviewLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', article.author_id)
          .maybeSingle();
        
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
    return 'AU';
  };

  // Calculate rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const hasReviewDetails = article.type === "review" && article.review_details?.[0];
  const reviewDetails = hasReviewDetails ? article.review_details![0] : null;
  const overallScore = reviewDetails?.overall_score || 0;
  
  // Get the award from layout settings if it exists
  const award = article.layout_settings?.award;

  return (
    <article className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-gray-600 text-lg mb-4"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
          {article.published_at && (
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(article.published_at), 'MMMM d, yyyy')}
            </span>
          )}
          
          {authorProfile && (
            <span className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={authorProfile.avatar_url || ''} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span>{authorProfile.display_name || 'Author'}</span>
            </span>
          )}
        </div>
      </header>
      
      {/* Award Banner */}
      <AwardBanner award={award} />
      
      {/* Score and Featured Image Section */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {article.featured_image && (
          <div className="sm:flex-1">
            <img 
              src={article.featured_image} 
              alt={article.title} 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        
        {hasReviewDetails && (
          <div className="sm:w-64 flex-shrink-0">
            <div className="border rounded-lg overflow-hidden">
              <div className={`py-4 px-6 text-center text-white ${getRatingColor(overallScore)}`}>
                <div className="text-4xl font-bold">{overallScore.toFixed(1)}</div>
                <div className="font-medium">Overall Score</div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Quick Review</h3>
                
                <div className="space-y-1">
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Great value</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Easy setup</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <X className="h-4 w-4 mr-2" />
                    <span className="text-sm">Limited battery life</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="prose max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      </div>
      
      {/* Basic Specs */}
      {hasReviewDetails && reviewDetails.product_specs && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 divide-y divide-gray-100">
              {Object.entries(reviewDetails.product_specs).map(([key, value], index) => (
                <div key={index} className={`p-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CTA */}
      <div className="bg-gray-100 p-4 rounded-lg text-center mt-6">
        <p className="mb-2">Want to know more about this product?</p>
        <button className="inline-flex items-center text-blue-600 font-medium">
          Read full review <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </article>
  );
};
