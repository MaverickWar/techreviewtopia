import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Info, ThumbsUp, ThumbsDown, Star, StarHalf } from "lucide-react";
import { AwardBanner } from "./AwardBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Add award formatting function
const formatAwardLevel = (level: string) => {
  const formatMap: Record<string, string> = {
    'editors-choice': 'Editor\'s Choice',
    'top-pick': 'Top Pick',
    'best-value': 'Best Value',
    'excellence': 'Excellence Award',
    'recommended': 'Recommended',
    'gold': 'Gold Award'
  };
  
  return formatMap[level.toLowerCase()] || 
    level.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface BasicReviewLayoutProps {
  article: ArticleData;
}

export const BasicReviewLayout: React.FC<BasicReviewLayoutProps> = ({ article }) => {
  // Updated award level handling
  const rawAwardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const awardLevel = rawAwardLevel ? formatAwardLevel(rawAwardLevel) : null;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;

  // Rest of the existing code remains the same until the return statement...

  return (
    <article className={`${getMaxWidthClass()} mx-auto px-4 py-8 ${getTextAlignmentClass()} ${getFontSizeClasses()} ${getColorThemeClasses()} overflow-x-hidden`}>
      {/* Updated award banner implementation */}
      {showAwards && awardLevel && (
        <div className="mb-6">
          <Badge variant="award" className="flex items-center gap-2 px-4 py-2 text-sm w-fit mx-auto">
            <Award className="h-4 w-4" />
            <span>{awardLevel}</span>
          </Badge>
        </div>
      )}
      
      {/* Rest of the existing JSX remains the same... */}
      
      {/* Updated rating display to show /5 instead of /10 */}
      {reviewDetails?.overall_score !== undefined && (
        <div className={`${colorTheme === "default" ? "bg-gray-100" : ""} p-4 rounded-lg mb-8 overflow-hidden`}>
          <h2 className={`text-lg font-semibold mb-2 ${getHeadingStyleClasses()}`}>Overall Rating</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-2">
              {(reviewDetails.overall_score / 2).toFixed(1)}
            </div>
            <div className="text-gray-500">/ 5</div>
          </div>
        </div>
      )}

      {/* Updated rating criteria to 5-point scale */}
      {showRatingCriteria && article.rating_criteria && article.rating_criteria.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${getHeadingStyleClasses()}`}>Rating Breakdown</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${getSectionSpacingClass()}`}>
            {article.rating_criteria.map((criterion, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 ${
                  criterion.score >= 4 ? "bg-green-500" : 
                  criterion.score >= 2.5 ? "bg-amber-500" : "bg-red-500"
                }`} style={{ width: `${(criterion.score / 5) * 100}%` }}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate pr-2">{criterion.name}</span>
                    <span className="text-lg font-bold flex-shrink-0">{(criterion.score / 2).toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rest of the existing JSX remains the same... */}
    </article>
  );
};
