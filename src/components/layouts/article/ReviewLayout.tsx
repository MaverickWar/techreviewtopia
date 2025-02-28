
import { Star, Calendar, User, Check, Info, Award, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewLayoutProps {
  article: ArticleData;
}

export const ReviewLayout = ({ article }: ReviewLayoutProps) => {
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

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8">
          {/* Title & Meta */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
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
            
            {article.description && (
              <p className="text-xl text-gray-600">
                {article.description}
              </p>
            )}
          </div>
          
          {/* Featured Image */}
          {article.featured_image && (
            <div className="aspect-[16/9] overflow-hidden rounded-xl mb-8">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Review Video */}
          {reviewDetails?.youtube_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <iframe
                src={reviewDetails.youtube_url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          {/* Main Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4">
          {/* Score Card */}
          {hasReviewDetails && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 sticky top-8">
              <div className={`py-6 text-center text-white ${getRatingColor(overallScore)}`}>
                <div className="text-5xl font-bold mb-1">{overallScore.toFixed(1)}</div>
                <div className="text-sm uppercase tracking-wider">Overall Score</div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Pros and Cons */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                    Pros
                  </h3>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">Great performance</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">Excellent value</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">Premium design</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ThumbsDown className="h-5 w-5 mr-2 text-red-500" />
                    Cons
                  </h3>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">Limited battery life</span>
                    </li>
                    <li className="flex items-start">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">Higher price point</span>
                    </li>
                  </ul>
                </div>
                
                {/* Verdict */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    Verdict
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {article.description || "An excellent option that delivers solid performance and value, despite a few minor drawbacks."}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Specifications Table */}
          {hasReviewDetails && reviewDetails.product_specs && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="bg-gray-100 py-3 px-6 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  Specifications
                </h3>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(reviewDetails.product_specs).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 text-gray-600 font-medium">{key}</td>
                        <td className="py-2 text-gray-900">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Gallery */}
      {hasReviewDetails && reviewDetails.gallery && reviewDetails.gallery.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reviewDetails.gallery.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
