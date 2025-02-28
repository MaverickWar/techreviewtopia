
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";

interface ClassicLayoutProps {
  article: ArticleData;
}

export const ClassicLayout: React.FC<ClassicLayoutProps> = ({ article }) => {
  return (
    <article className="max-w-4xl mx-auto p-4 md:p-8 relative">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-xl text-gray-600 mb-6 prose"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex items-center gap-4">
          {article.author && (
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
                <AvatarFallback>{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{article.author.display_name || "Anonymous"}</div>
                {article.published_at && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image && (
        <div className="mb-8">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none" 
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />
      
      <Separator className="my-8" />
      
      {/* Footer */}
      <footer className="text-sm text-gray-500">
        <p>Article ID: {article.id}</p>
        {article.published_at && (
          <p>Published: {new Date(article.published_at).toLocaleDateString()}</p>
        )}
      </footer>

      {/* Back to top button - Fixed positioned with proper z-index */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-20"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
