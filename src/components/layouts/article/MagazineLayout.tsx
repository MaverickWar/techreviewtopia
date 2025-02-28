
import { Link } from "react-router-dom";
import { Star, Calendar, User, BookOpen, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";

interface MagazineLayoutProps {
  article: ArticleData;
}

export const MagazineLayout = ({ article }: MagazineLayoutProps) => {
  return (
    <article className="max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="relative h-[70vh] min-h-[500px] w-full">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-white/90 mb-4 text-sm">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-white/80" />
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Author Name
              </span>
              <span className="w-1 h-1 rounded-full bg-white/80" />
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                8 min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                {article.description}
              </p>
            )}
            
            {article.type === "review" && article.review_details?.[0]?.overall_score && (
              <div className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full font-semibold text-lg">
                {article.review_details[0].overall_score.toFixed(1)}/10
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Share buttons */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      
        {/* Main Content with pull quotes */}
        <div className="prose prose-lg max-w-none">
          {article.type === "review" && article.review_details?.[0]?.youtube_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <iframe
                src={article.review_details[0].youtube_url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </div>
      </div>
    </article>
  );
};
