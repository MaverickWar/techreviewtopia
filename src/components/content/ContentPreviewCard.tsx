
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, FileText, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export interface ContentPreviewCardProps {
  slug: string;
  categorySlug: string;
  title: string;
  description: string | null;
  type: "article" | "review";
  featuredImage: string | null;
  publishedAt: string | null;
  overallScore?: number | null;
  award?: string | null; 
}

export const ContentPreviewCard = ({
  slug,
  categorySlug,
  title,
  description,
  type,
  featuredImage,
  publishedAt,
  overallScore,
  award,
}: ContentPreviewCardProps) => {
  // Map kebab-case award values to their display names
  const getAwardDisplayName = (awardValue: string): string => {
    const awardMap: Record<string, string> = {
      "editors-choice": "Editor's Choice",
      "best-value": "Best Value",
      "best-performance": "Best Performance",
      "highly-recommended": "Highly Recommended",
      "budget-pick": "Budget Pick",
      "premium-choice": "Premium Choice",
      "most-innovative": "Most Innovative"
    };
    
    return awardMap[awardValue] || awardValue
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format award for display if one exists
  const formattedAward = award ? getAwardDisplayName(award) : null;

  return (
    <Link to={`/${categorySlug}/content/${slug}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {featuredImage ? (
          <div className="aspect-[16/9] overflow-hidden relative">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
              {formattedAward && (
                <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md animate-fade-in">
                  <Award className="h-3.5 w-3.5" />
                  <span>{formattedAward}</span>
                </Badge>
              )}
            </div>
            <div className="absolute top-2 left-2 flex flex-wrap gap-2 max-w-[70%]">
              <Badge variant="default" className={`${
                type === "review" 
                  ? "bg-purple-600" 
                  : "bg-blue-600"
              } text-white flex items-center gap-1 px-3 py-1.5 shadow-md`}>
                {type === "review" ? "Review" : "Article"}
              </Badge>
              {type === "review" && overallScore !== null && (
                <Badge variant="default" className="bg-orange-500 text-white flex items-center gap-1 px-3 py-1.5 shadow-md">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {overallScore.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
            {type === "article" ? (
              <FileText className="h-12 w-12 text-gray-400" />
            ) : (
              <Star className="h-12 w-12 text-gray-400" />
            )}
            <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
              {formattedAward && (
                <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md animate-fade-in">
                  <Award className="h-3.5 w-3.5" />
                  <span>{formattedAward}</span>
                </Badge>
              )}
            </div>
            <div className="absolute top-2 left-2 flex flex-wrap gap-2 max-w-[70%]">
              <Badge variant="default" className={`${
                type === "review" 
                  ? "bg-purple-600" 
                  : "bg-blue-600"
              } text-white flex items-center gap-1 px-3 py-1.5 shadow-md`}>
                {type === "review" ? "Review" : "Article"}
              </Badge>
              {type === "review" && overallScore !== null && (
                <Badge variant="default" className="bg-orange-500 text-white flex items-center gap-1 px-3 py-1.5 shadow-md">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {overallScore.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {publishedAt && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
          {description && (
            <div 
              className="text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
