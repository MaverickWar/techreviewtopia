
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Calendar, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContentPreviewCardProps {
  slug: string;
  categorySlug: string;
  title: string;
  description: string | null;
  type: "article" | "review";
  featuredImage: string | null;
  publishedAt: string | null;
  overallScore?: number | null;
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
}: ContentPreviewCardProps) => {
  return (
    <Link to={`/${categorySlug}/${slug}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {featuredImage ? (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {type === "article" ? (
              <FileText className="h-12 w-12 text-gray-400" />
            ) : (
              <Star className="h-12 w-12 text-gray-400" />
            )}
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === "review" 
                ? "bg-purple-100 text-purple-700" 
                : "bg-blue-100 text-blue-700"
            }`}>
              {type === "review" ? "Review" : "Article"}
            </span>
            {type === "review" && overallScore !== null && (
              <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                <Star className="h-4 w-4 fill-current" />
                {overallScore.toFixed(1)}
              </span>
            )}
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
            <p className="text-gray-600 line-clamp-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
