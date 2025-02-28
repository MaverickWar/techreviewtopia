
import { 
  Star, 
  Calendar, 
  User, 
  Check, 
  Info, 
  Award, 
  ThumbsUp, 
  ThumbsDown,
  ChevronRight,
  Heart,
  BarChart,
  Share
} from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface EnhancedReviewLayoutProps {
  article: ArticleData;
}

export const EnhancedReviewLayout = ({ article }: EnhancedReviewLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
  const gallery = reviewDetails?.gallery || [];

  return (
    <article className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-8">
        {article.featured_image && (
          <div className="w-full h-[300px] md:h-[400px] relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">
                {article.title}
              </h1>
              
              {article.description && (
                <div 
                  className="text-xl text-white/90 mb-4 max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: article.description }}
                />
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
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
                
                {hasReviewDetails && (
                  <div className="ml-auto flex items-center gap-6">
                    <div className={`px-3 py-1 rounded-full ${getRatingColor(overallScore)} text-white flex items-center font-bold`}>
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      {overallScore.toFixed(1)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8">
          {/* Interactive Gallery */}
          {hasReviewDetails && gallery.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Product Gallery</h2>
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                  <img
                    src={gallery[activeImageIndex]}
                    alt={`Product view ${activeImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition
                        ${activeImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Review Video */}
          {reviewDetails?.youtube_url && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Video Review</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={reviewDetails.youtube_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="prose prose-lg max-w-none mb-10">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p>No content available.</p>
            )}
          </div>
        </div>
        
        {/* Sidebar - Move from sticky to static position */}
        <div className="lg:col-span-4">
          {/* Product Specifications Table - Moved up in the sidebar */}
          {hasReviewDetails && reviewDetails.product_specs && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
              <div className="bg-gray-100 py-3 px-6 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  Key Specifications
                </h3>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(reviewDetails.product_specs).map(([key, value], index) => (
                      <tr key={index} className={`${index !== Object.entries(reviewDetails.product_specs).length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <td className="py-2 pr-2 text-gray-600 font-medium">{key}</td>
                        <td className="py-2 text-gray-900">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Comparison Chart - Also moved up from the bottom */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-100 py-3 px-6 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-purple-500" />
                How It Compares
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Product</span>
                    <span className="font-medium">{overallScore.toFixed(1)}/10</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(overallScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Competitor A</span>
                    <span className="font-medium">7.8/10</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Competitor B</span>
                    <span className="font-medium">8.5/10</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <a href="#" className="text-sm text-blue-600 flex items-center hover:underline">
                    View full comparison <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Score Card - Moved to the bottom of the sidebar */}
          {hasReviewDetails && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
              <div className={`py-6 text-center text-white ${getRatingColor(overallScore)}`}>
                <div className="text-5xl font-bold mb-1">{overallScore.toFixed(1)}</div>
                <div className="text-sm uppercase tracking-wider">Overall Score</div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Verdict */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Verdict
                  </h3>
                  <div className="text-gray-700">
                    {article.description ? (
                      <div dangerouslySetInnerHTML={{ __html: article.description }} />
                    ) : (
                      <p>An excellent product that delivers great value despite a few minor drawbacks.</p>
                    )}
                  </div>
                </div>
                
                {/* Pros and Cons - Using a grid layout for better mobile display */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                      Pros
                    </h3>
                    <ul className="space-y-1">
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
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-500" />
                      Cons
                    </h3>
                    <ul className="space-y-1">
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
                
                {/* Buy Button */}
                <Button className="w-full" size="lg">
                  Check Price
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Ratings Section - Now Moved to the Bottom of the Page */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Detailed Ratings and Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detailed Ratings */}
          {article.rating_criteria && article.rating_criteria.length > 0 && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="bg-gray-100 py-3 px-6 border-b">
                <h3 className="font-semibold text-gray-900">Detailed Ratings</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {article.rating_criteria.map((criterion, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{criterion.name}</span>
                        <span className="font-bold">{criterion.score.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getRatingColor(criterion.score)}`}
                          style={{ width: `${(criterion.score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Remove the duplicated overall rating summary that appears on desktop */}
          {/* Overall Rating Summary Card has been removed */}
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl text-center">
        <h3 className="text-xl font-bold mb-2">Want to see more reviews like this?</h3>
        <p className="text-gray-600 mb-4">Subscribe to our newsletter for the latest product reviews and tech news.</p>
        <Button>
          Subscribe Now
        </Button>
      </div>
    </article>
  );
};
