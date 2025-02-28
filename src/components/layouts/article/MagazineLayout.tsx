
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MagazineLayoutProps {
  article: ArticleData;
}

export const MagazineLayout: React.FC<MagazineLayoutProps> = ({ article }) => {
  return (
    <article className="max-w-6xl mx-auto relative">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[70vh] lg:min-h-[600px] mb-8 z-0">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{article.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-12 z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>
          {article.description && (
            <div 
              className="text-xl text-white/90 mb-6 max-w-3xl prose prose-invert"
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          )}
          <div className="flex items-center gap-4">
            {article.author && (
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3 border-2 border-white">
                  <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
                  <AvatarFallback className="bg-purple-700 text-white">{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{article.author.display_name || "Anonymous"}</div>
                  {article.published_at && (
                    <div className="text-sm text-white/80 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" className="ml-auto text-white border-white hover:bg-white/20 hover:text-white z-10">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-0 relative z-0">
        {/* Main Content */}
        <div 
          className="prose prose-lg max-w-none mb-12" 
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />
        
        <Separator className="my-8" />
        
        {/* Footer */}
        <footer className="text-sm text-gray-500 mb-12">
          <p>Article ID: {article.id}</p>
          {article.published_at && (
            <p>Published: {new Date(article.published_at).toLocaleDateString()}</p>
          )}
        </footer>
      </div>

      {/* Back to top button - Fixed positioned with proper z-index */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-20"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
