
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArticleData } from "@/types/content";
import { Award, Check, ChevronRight, Clock, Info, Star, ThumbsDown, ThumbsUp, User } from "lucide-react";

interface EnhancedReviewLayoutProps {
  article: ArticleData;
}

export const EnhancedReviewLayout: React.FC<EnhancedReviewLayoutProps> = ({ article }) => {
  // Get review details if available
  const hasReviewDetails = article.type === "review" && article.review_details?.[0];
  const reviewDetails = hasReviewDetails ? article.review_details![0] : null;
  const overallScore = reviewDetails?.overall_score || 0;

  // Calculate rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-blue-500";
    if (score >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  // Get star rating elements based on score
  const getStarRating = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const halfStar = score % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && (
          <span className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <Star className="absolute top-0 left-0 w-5 h-5 text-yellow-400 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{score.toFixed(1)}/10</span>
      </div>
    );
  };

  return (
    <article className="max-w-7xl mx-auto pb-12">
      {/* Hero Section with Featured Image as Background */}
      <div className="relative h-[500px] mb-8">
        {article.featured_image ? (
          <div className="absolute inset-0">
            <img 
              src={article.featured_image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black to-gray-800"></div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white z-10">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
              {article.title}
            </h1>
            
            {article.description && (
              <div 
                className="text-xl text-white mb-6 drop-shadow-sm"
                dangerouslySetInnerHTML={{ __html: article.description }}
              />
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {article.published_at && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </div>
              )}
              
              {article.author && (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || ""} />
                    <AvatarFallback>
                      {article.author.display_name?.substring(0, 2) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span>{article.author.display_name || "Anonymous"}</span>
                </div>
              )}
              
              {hasReviewDetails && (
                <Badge className="bg-orange-500 hover:bg-orange-600">
                  {overallScore.toFixed(1)}/10
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns on desktop */}
          <div className="lg:col-span-8">
            {/* Key Takeaways */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Key Takeaways</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Impressive performance with the latest hardware</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Premium build quality and design</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Excellent battery life for all-day usage</span>
                </li>
                <li className="flex items-start">
                  <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Premium price point may not be for everyone</span>
                </li>
              </ul>
            </div>
            
            {/* YouTube Video Embed */}
            {reviewDetails?.youtube_url && (
              <div className="mb-8">
                <iframe
                  src={reviewDetails.youtube_url.replace('watch?v=', 'embed/')}
                  className="w-full aspect-video rounded-lg shadow-lg"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
            </div>
            
            {/* Gallery Grid */}
            {hasReviewDetails && reviewDetails.gallery && reviewDetails.gallery.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {reviewDetails.gallery.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pros and Cons */}
            {hasReviewDetails && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pros & Cons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="flex items-center text-lg font-bold text-green-700 mb-4">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      What We Like
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Exceptional camera system with improved low-light performance</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Vibrant and responsive 120Hz display</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>All-day battery life with fast charging capabilities</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Cons */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="flex items-center text-lg font-bold text-red-700 mb-4">
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      What Could Be Better
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Premium price point continues to increase</span>
                      </li>
                      <li className="flex items-start">
                        <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>No charger included in the box</span>
                      </li>
                      <li className="flex items-start">
                        <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Limited innovation compared to previous generation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 4 columns on desktop */}
          <div className="lg:col-span-4">
            {/* Overall Score Card */}
            {hasReviewDetails && (
              <div className="bg-white border rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 text-center bg-gray-50 border-b">
                  <h3 className="text-xl font-bold mb-3">Our Verdict</h3>
                  <div className={`text-5xl font-bold mb-2 ${getRatingColor(overallScore)}`}>
                    {overallScore.toFixed(1)}
                  </div>
                  <div className="mb-2">
                    {getStarRating(overallScore)}
                  </div>
                  <Badge variant={overallScore >= 8 ? "default" : "outline"} className="mt-2">
                    <Award className="h-4 w-4 mr-1" />
                    {overallScore >= 9 ? "Editor's Choice" : overallScore >= 8 ? "Highly Recommended" : "Recommended"}
                  </Badge>
                </div>
                
                <div className="p-6">
                  {article.rating_criteria && article.rating_criteria.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {article.rating_criteria.map((criteria, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>{criteria.name}</span>
                            <span className="font-medium">{criteria.score.toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(criteria.score / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button className="w-full">
                    Check Price
                  </Button>
                </div>
              </div>
            )}
            
            {/* Specifications Table */}
            {hasReviewDetails && reviewDetails.product_specs && (
              <div className="bg-white border rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-bold flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Product Specifications
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(reviewDetails.product_specs).map(([key, value]) => (
                        <tr key={key} className="border-b last:border-0">
                          <td className="py-2 font-medium text-gray-500">{key}</td>
                          <td className="py-2 text-right">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Related Reviews */}
            <div className="bg-white border rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-bold">Related Reviews</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="flex group">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
                        <img src="https://images.unsplash.com/photo-1616052257870-70e77c8c8946?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=100&q=60" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">iPhone 15 Pro Max Review</h4>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 text-gray-300" />
                          <span className="text-xs ml-1">8.5</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex group">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
                        <img src="https://images.unsplash.com/photo-1637139414272-2ceb927a8ae2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzR8fHBpeGVsJTIwcGhvbmV8ZW58MHx8MHx8&auto=format&fit=crop&w=100&q=60" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">Google Pixel 8 Pro Review</h4>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">9.2</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex group">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
                        <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftc3VuZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&q=60" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">Samsung Galaxy A54 Review</h4>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <Star className="w-3 h-3 text-gray-300" />
                          <Star className="w-3 h-3 text-gray-300" />
                          <span className="text-xs ml-1">7.8</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                </ul>
                <Button variant="ghost" className="w-full mt-4 text-sm">
                  View All Reviews
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
