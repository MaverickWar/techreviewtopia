
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import { AwardBanner } from "./AwardBanner";

interface BasicReviewLayoutProps {
  article: ArticleData;
}

export const BasicReviewLayout: React.FC<BasicReviewLayoutProps> = ({ article }) => {
  // Extract award from layout settings
  // Check for both awardLevel (new) and award (legacy)
  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
  
  // Extract other layout settings with defaults
  const contentAlignment = article.layout_settings?.contentAlignment || "left";
  const showFeaturedImage = article.layout_settings?.showFeaturedImage !== undefined ? 
    article.layout_settings.showFeaturedImage : true;
  const layoutWidth = article.layout_settings?.layoutWidth || "standard";
  
  console.log("BasicReviewLayout received article with layout_settings:", article.layout_settings);
  console.log("Layout settings extracted:", {
    awardLevel,
    showAwards,
    contentAlignment,
    showFeaturedImage,
    layoutWidth
  });

  // Get review details if available
  const reviewDetails = article.review_details?.[0];
  
  // Helper function to format the date
  const formatPublishDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Determine the max width based on layout width setting
  const getMaxWidthClass = () => {
    switch (layoutWidth) {
      case "narrow": return "max-w-2xl";
      case "standard": return "max-w-4xl";
      case "wide": return "max-w-6xl";
      case "full": return "max-w-full px-4 md:px-8";
      default: return "max-w-4xl";
    }
  };

  // Determine the text alignment class
  const getTextAlignmentClass = () => {
    switch (contentAlignment) {
      case "left": return "text-left";
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  return (
    <article className={`${getMaxWidthClass()} mx-auto px-4 py-8 ${getTextAlignmentClass()}`}>
      {/* Award banner - Add support for both award and awardLevel */}
      {showAwards && awardLevel && (
        <AwardBanner awardLevel={awardLevel} />
      )}
      
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-lg text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{article.author?.display_name || "Editorial Team"}</span>
          </div>
          
          {article.published_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatPublishDate(article.published_at)}</span>
            </div>
          )}
        </div>
      </header>
      
      {showFeaturedImage && article.featured_image && (
        <img 
          src={article.featured_image} 
          alt={article.title}
          className="w-full h-auto rounded-lg mb-8 object-cover"
        />
      )}
      
      {/* Simple rating display */}
      {reviewDetails?.overall_score !== undefined && (
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-2">Overall Rating</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-2">
              {reviewDetails.overall_score.toFixed(1)}
            </div>
            <div className="text-gray-500">/ 10</div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      {article.content && (
        <div 
          className={`prose max-w-none mb-12 ${getTextAlignmentClass()}`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      )}
      
      {/* Simple pros and cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            Pros
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Good value for money</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Solid construction</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Easy to use</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
            Cons
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <span>Limited features</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <span>Battery life could be better</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Verdict */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          Verdict
        </h3>
        <p className="text-gray-700">
          Overall, this is a solid product that offers good value for money. While it has some limitations, it performs well for its intended purpose and is easy to use.
        </p>
      </div>
    </article>
  );
};
