
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Info, ThumbsUp, ThumbsDown, Star, StarHalf } from "lucide-react";
import { AwardBanner } from "./AwardBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BasicReviewLayoutProps {
  article: ArticleData;
}

export const BasicReviewLayout: React.FC<BasicReviewLayoutProps> = ({ article }) => {
  // Extract award from layout settings
  // Check for both awardLevel (new) and award (legacy)
  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
  
  // Extract basic layout settings with reasonable defaults
  const contentAlignment = article.layout_settings?.contentAlignment || "left";
  const showFeaturedImage = article.layout_settings?.showFeaturedImage !== undefined ? 
    article.layout_settings.showFeaturedImage : true;
  const layoutWidth = article.layout_settings?.layoutWidth || "standard";
  const colorTheme = article.layout_settings?.colorTheme || "default";
  const fontSize = article.layout_settings?.fontSize || "medium";
  const headingStyle = article.layout_settings?.headingStyle || "standard";
  const showProsConsSection = article.layout_settings?.showProsConsSection !== undefined ?
    article.layout_settings.showProsConsSection : true;
  const showVerdictSection = article.layout_settings?.showVerdictSection !== undefined ?
    article.layout_settings.showVerdictSection : true;
  const showRatingCriteria = article.layout_settings?.showRatingCriteria !== undefined ?
    article.layout_settings.showRatingCriteria : true;
  const ratingDisplayStyle = article.layout_settings?.ratingDisplayStyle || "numeric";
  const sectionSpacing = article.layout_settings?.sectionSpacing || 4;
  
  // Get pros and cons content
  const prosItems = article.layout_settings?.prosItems || [
    "Good value for money",
    "Solid construction",
    "Easy to use"
  ];
  
  const consItems = article.layout_settings?.consItems || [
    "Limited features",
    "Battery life could be better"
  ];
  
  // Get verdict content
  const verdictText = article.layout_settings?.verdictText || 
    "Overall, this is a solid product that offers good value for money. While it has some limitations, it performs well for its intended purpose and is easy to use.";
  
  // Get specifications
  const specifications = article.layout_settings?.specifications || [];
  const showSpecifications = article.layout_settings?.showSpecifications !== undefined ?
    article.layout_settings.showSpecifications : true;
  
  console.log("BasicReviewLayout received article with layout_settings:", article.layout_settings);

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

  // Determine font size classes
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case "small": return "text-sm";
      case "medium": return "text-base";
      case "large": return "text-lg";
      default: return "text-base";
    }
  };

  // Determine heading style classes
  const getHeadingStyleClasses = () => {
    switch (headingStyle) {
      case "underlined": return "border-b pb-2";
      case "bold": return "font-extrabold";
      case "colored": return "text-blue-600";
      default: return "";
    }
  };

  // Determine color theme classes
  const getColorThemeClasses = () => {
    switch (colorTheme) {
      case "blue": return "bg-blue-50";
      case "green": return "bg-green-50";
      case "purple": return "bg-purple-50";
      case "orange": return "bg-orange-50";
      case "red": return "bg-red-50";
      case "gray": return "bg-gray-50";
      default: return "bg-white";
    }
  };

  // Get section spacing class
  const getSectionSpacingClass = () => {
    return `gap-${sectionSpacing}`;
  };

  // Helper function to render rating based on display style
  const renderRating = (score: number) => {
    switch (ratingDisplayStyle) {
      case "stars":
        return (
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = (i + 1) * 2;
              if (score >= starValue) {
                return <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
              } else if (score >= starValue - 1) {
                return <StarHalf key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
              } else {
                return <Star key={i} className="h-5 w-5 text-yellow-500" />;
              }
            })}
            <span className="ml-2 text-sm text-gray-500">({score.toFixed(1)})</span>
          </div>
        );
      case "bars":
        return (
          <div className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-lg font-bold">{score.toFixed(1)}</span>
              <span className="text-gray-500">/ 10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(score / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        );
      case "minimal":
        return (
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
            {score.toFixed(1)}
          </div>
        );
      case "numeric":
      default:
        return (
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-2">
              {score.toFixed(1)}
            </div>
            <div className="text-gray-500">/ 10</div>
          </div>
        );
    }
  };

  return (
    <article className={`${getMaxWidthClass()} mx-auto px-4 py-8 ${getTextAlignmentClass()} ${getFontSizeClasses()} ${getColorThemeClasses()}`}>
      {/* Award banner - Add support for both award and awardLevel */}
      {showAwards && awardLevel && (
        <AwardBanner awardLevel={awardLevel} />
      )}
      
      <header className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${getHeadingStyleClasses()}`}>{article.title}</h1>
        
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
        <div className={`${colorTheme === "default" ? "bg-gray-100" : ""} p-4 rounded-lg mb-8`}>
          <h2 className={`text-lg font-semibold mb-2 ${getHeadingStyleClasses()}`}>Overall Rating</h2>
          {renderRating(reviewDetails.overall_score)}
        </div>
      )}
      
      {/* Rating criteria if available and enabled */}
      {showRatingCriteria && article.rating_criteria && article.rating_criteria.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${getHeadingStyleClasses()}`}>Rating Breakdown</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${getSectionSpacingClass()}`}>
            {article.rating_criteria.map((criterion, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 ${
                  criterion.score >= 8 ? "bg-green-500" : 
                  criterion.score >= 6 ? "bg-amber-500" : "bg-red-500"
                }`} style={{ width: `${criterion.score * 10}%` }}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{criterion.name}</span>
                    <span className="text-lg font-bold">{criterion.score.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Main content */}
      {article.content && (
        <div 
          className={`prose max-w-none mb-8 ${getTextAlignmentClass()}`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      )}
      
      {/* Product specifications */}
      {showSpecifications && specifications.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${getHeadingStyleClasses()}`}>Specifications</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specifications.map((spec, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{spec.label}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Simple pros and cons */}
      {showProsConsSection && (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${getSectionSpacingClass()} mb-8`}>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className={`text-lg font-semibold mb-2 flex items-center ${getHeadingStyleClasses()}`}>
              <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
              Pros
            </h3>
            <ul className="space-y-2">
              {prosItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className={`text-lg font-semibold mb-2 flex items-center ${getHeadingStyleClasses()}`}>
              <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
              Cons
            </h3>
            <ul className="space-y-2">
              {consItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Verdict */}
      {showVerdictSection && (
        <div className={`bg-blue-50 p-6 rounded-lg mb-8 ${
          colorTheme === "blue" ? "bg-blue-100" : 
          colorTheme === "green" ? "bg-green-50" : 
          colorTheme === "purple" ? "bg-purple-50" : 
          colorTheme === "orange" ? "bg-orange-50" : 
          colorTheme === "red" ? "bg-red-50" : 
          colorTheme === "gray" ? "bg-gray-100" : 
          "bg-blue-50"
        }`}>
          <h3 className={`text-lg font-semibold mb-2 flex items-center ${getHeadingStyleClasses()}`}>
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            Verdict
          </h3>
          <p className="text-gray-700">{verdictText}</p>
        </div>
      )}
      
      {/* Add subtle footer with date */}
      <div className="text-xs text-gray-400 text-center mt-8">
        Review published {article.published_at ? new Date(article.published_at).toLocaleDateString() : "recently"}
      </div>
    </article>
  );
};
