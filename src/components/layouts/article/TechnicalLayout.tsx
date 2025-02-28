
import React, { useEffect, useState } from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Copy, CheckCheck, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TechnicalLayoutProps {
  article: ArticleData;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export const TechnicalLayout: React.FC<TechnicalLayoutProps> = ({ article }) => {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  // Generate table of contents from the article content
  useEffect(() => {
    if (article.content) {
      // Create a temporary div to parse the HTML content
      const div = document.createElement('div');
      div.innerHTML = article.content;
      
      // Find all heading elements
      const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Create TOC items from headings
      const items: TOCItem[] = Array.from(headings).map((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent || `Section ${index + 1}`;
        const id = `section-${index}`;
        
        // Add ID to the heading in the original content for scrolling
        heading.id = id;
        
        return { id, text, level };
      });
      
      setToc(items);
    }
  }, [article.content]);

  // Handle intersection observer to highlight active section
  useEffect(() => {
    if (toc.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );
    
    // Observe all section headings
    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    
    return () => {
      toc.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [toc]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setShowMobileTOC(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:pb-16">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-xl text-gray-600 mb-6 prose"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            {article.author && (
              <div className="flex items-center mr-4">
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
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowMobileTOC(!showMobileTOC)}>
              <List className="h-4 w-4 mr-2" />
              Table of Contents
            </Button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image && (
        <div className="max-w-4xl mx-auto mb-8">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Mobile TOC (shown on button click) */}
      {showMobileTOC && (
        <div className="md:hidden mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Table of Contents</h3>
          <ul className="space-y-2">
            {toc.map((item) => (
              <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left ${
                    activeSection === item.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar with Table of Contents (desktop) */}
        {toc.length > 0 && (
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start h-[calc(100vh-120px)]">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Table of Contents</h3>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <ul className="space-y-3">
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`text-left text-sm hover:text-blue-600 ${
                          activeSection === item.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className={`w-full ${toc.length > 0 ? 'md:max-w-3xl' : 'max-w-4xl mx-auto'}`}>
          <div 
            className="prose prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-800 prose-pre:text-gray-100 max-w-none" 
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
      </div>
    </article>
  );
};
