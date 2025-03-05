
import React from "react";
import { ArticleData } from "@/types/content";
import { AwardBanner } from "./AwardBanner";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClassicLayoutProps {
  article: ArticleData;
}

export const ClassicLayout: React.FC<ClassicLayoutProps> = ({ article }) => {
  // Extract award from layout settings (supporting both awardLevel and award)
  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
  
  // Helper function to format the date
  const formatPublishDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Extract author name with fallback
  const authorName = article.author?.display_name || 
                     article.author?.email?.split('@')[0] || 
                     "Editorial Team";

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* Award banner */}
      {showAwards && awardLevel && (
        <AwardBanner awardLevel={awardLevel} />
      )}
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 break-words">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-xl text-gray-700 mb-6 leading-relaxed break-words prose"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">By {authorName}</span>
          </div>
          
          {article.published_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{formatPublishDate(article.published_at)}</span>
            </div>
          )}
          
          <Badge variant="outline" className="ml-auto">
            {article.type === "review" ? "Review" : "Article"}
          </Badge>
        </div>
      </header>
      
      {article.featured_image && (
        <div className="w-full overflow-hidden rounded-lg mb-8">
          <img 
            src={article.featured_image} 
            alt={article.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      {article.content && (
        <div 
          className="prose prose-lg max-w-none break-words overflow-hidden"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      )}
      
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>
            Published: {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Draft"}
          </span>
        </div>
      </footer>
    </article>
  );
};
