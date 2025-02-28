
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, MessageSquare, Share2 } from "lucide-react";

interface MagazineLayoutProps {
  article: ArticleData;
}

export const MagazineLayout: React.FC<MagazineLayoutProps> = ({ article }) => {
  return (
    <article className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="rounded-full px-3 bg-gray-100 hover:bg-gray-200 border-none text-gray-800">
            Technology
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 bg-gray-100 hover:bg-gray-200 border-none text-gray-800">
            Review
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-xl md:text-2xl text-gray-600 mb-6 font-serif"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            {article.author && (
              <div className="flex items-center mr-6">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
                  <AvatarFallback>{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{article.author.display_name || "Anonymous"}</div>
                  <div className="text-sm text-gray-500">Contributing Writer</div>
                </div>
              </div>
            )}
            
            {article.published_at && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <MessageSquare className="h-5 w-5 mr-1" />
              <span>12 Comments</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <Share2 className="h-5 w-5 mr-1" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-width featured image */}
      {article.featured_image && (
        <div className="mb-12 -mx-4 md:-mx-8">
          <figure>
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto object-cover max-h-[600px]"
            />
            <figcaption className="text-sm text-gray-500 italic mt-2 px-4 md:px-0">
              Featured image: {article.title}
            </figcaption>
          </figure>
        </div>
      )}

      {/* Content with large initial letter */}
      <div className="prose prose-lg md:prose-xl max-w-none mb-12 font-serif">
        <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
      </div>
      
      {/* Next/Previous Article Links */}
      <Separator className="my-12" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <a href="#" className="group">
          <div className="text-sm text-gray-500 mb-2 group-hover:text-blue-600">
            &larr; Previous Article
          </div>
          <div className="font-bold text-xl group-hover:text-blue-600">Top 10 Smartphones of 2023</div>
        </a>
        
        <a href="#" className="group text-right">
          <div className="text-sm text-gray-500 mb-2 group-hover:text-blue-600">
            Next Article &rarr;
          </div>
          <div className="font-bold text-xl group-hover:text-blue-600">The Future of Wearable Technology</div>
        </a>
      </div>
      
      {/* Author Bio */}
      {article.author && (
        <div className="bg-gray-50 p-6 rounded-xl mb-12">
          <div className="flex items-start">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
              <AvatarFallback>{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-xl mb-2">About {article.author.display_name || "the Author"}</h3>
              <p className="text-gray-600 mb-4">
                Technology journalist and reviewer with over 10 years of experience in the industry. Specializes in mobile technology, consumer electronics, and the intersection of tech and daily life.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-800">Twitter</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">LinkedIn</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Website</a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Related Articles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <a key={item} href="#" className="group">
              <div className="mb-3 overflow-hidden rounded-lg">
                <img
                  src={`https://picsum.photos/seed/${item}/400/300`}
                  alt="Related article"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">
                The Impact of AI on Modern Smartphones
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                How artificial intelligence is changing the way we interact with our devices.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Read More 
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Newsletter Subscription */}
      <div className="bg-blue-50 p-8 rounded-xl mb-12 text-center">
        <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Subscribe to our newsletter for the latest tech reviews, news, and insights delivered directly to your inbox.
        </p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-l-lg border-y border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
      
      {/* Back to top button */}
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
