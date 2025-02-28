
import { Star, Calendar, User, Check, Info, Award, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AwardBanner } from "./AwardBanner";

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
  
  // Get the award from layout settings if it exists
  const award = article.layout_settings?.award;
  console.log("ReviewLayout received article with layout_settings:", article.layout_settings);
  console.log("Award value extracted:", award);

  return (
    <article className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Title & Meta */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
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
          <div 
            className="text-xl text-gray-600"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
      </div>
      
      {/* Award Banner */}
      <AwardBanner award={award} />
      
      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8">
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
            {article.content && (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4">
          {/* Specifications Table - Now only in sidebar */}
          {hasReviewDetails && reviewDetails.product_specs && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
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
          
          {/* CTA Button */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden p-6 mb-8">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
              Check Price
            </Button>
          </div>
        </div>
      </div>
      
      {/* Gallery - Moved up, before ratings */}
      {hasReviewDetails && reviewDetails.gallery && reviewDetails.gallery.length > 0 && (
        <div className="mt-12 mb-12">
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
      
      {/* Separate Ratings and Score Section - Always at the bottom, together */}
      {hasReviewDetails && (
        <div className="mt-12 pb-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Verdict</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Detailed Ratings - Left column (8/12) */}
            <div className="lg:col-span-8 bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Detailed Ratings</h3>
                
                {/* Rating criteria visualization */}
                <div className="space-y-5 mb-8">
                  {article.rating_criteria?.map((criteria, index) => (
                    <div key={index} className="w-full">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700 font-medium">{criteria.name}</span>
                        <span className="font-semibold">{criteria.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${(criteria.score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pros and Cons - Grid layout for better mobile display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                      Pros
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">Excellent performance</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">High-quality materials</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">Great value for money</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Cons */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-500" />
                      Cons
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ThumbsDown className="h-5 w-5 mr-2 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">Battery life could be better</span>
                      </li>
                      <li className="flex items-start">
                        <ThumbsDown className="h-5 w-5 mr-2 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">Limited connectivity options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Score Card - Right column (4/12) */}
            <div className="lg:col-span-4 bg-white shadow-lg rounded-xl overflow-hidden">
              <div className={`py-6 text-center text-white ${getRatingColor(overallScore)}`}>
                <div className="text-5xl font-bold mb-1">{overallScore.toFixed(1)}</div>
                <div className="text-sm uppercase tracking-wider">OVERALL SCORE</div>
              </div>
              
              <div className="p-6">
                {/* Verdict */}
                <div className="pt-2">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    Verdict
                  </h3>
                  <div className="text-gray-700 text-sm">
                    {article.description ? (
                      <div dangerouslySetInnerHTML={{ __html: article.description }} />
                    ) : (
                      <p>An excellent option that delivers solid performance and value, despite a few minor drawbacks.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Link */}
      {hasReviewDetails && (
        <div className="text-center mb-12">
          <a href="#" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
            View full comparison
            <svg className="w-5 h-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      )}
      
      {/* Newsletter subscription CTA */}
      <div className="bg-blue-50 rounded-xl p-8 text-center mb-12">
        <h3 className="text-xl font-bold mb-2">Want to see more reviews like this?</h3>
        <p className="text-gray-600 mb-4 max-w-xl mx-auto">Subscribe to our newsletter for the latest product reviews and tech news.</p>
        <button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded-lg font-medium">
          Subscribe Now
        </button>
      </div>

      {/* Back to top button - Increased z-index */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
