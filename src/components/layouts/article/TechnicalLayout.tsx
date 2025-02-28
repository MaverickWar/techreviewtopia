
import { Calendar, User, BookOpen, Link as LinkIcon, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TechnicalLayoutProps {
  article: ArticleData;
}

export const TechnicalLayout = ({ article }: TechnicalLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', article.author_id)
          .single();
        
        if (!error && data) {
          setAuthorProfile(data);
        }
      }
    };

    fetchAuthorProfile();
  }, [article.author_id]);

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (authorProfile?.display_name) {
      return authorProfile.display_name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
    }
    return authorProfile?.email ? authorProfile.email.substring(0, 2).toUpperCase() : 'AU';
  };

  // Generate table of contents from content
  const tocItems = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'prerequisites', title: 'Prerequisites' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'advanced-concepts', title: 'Advanced Concepts' },
    { id: 'conclusion', title: 'Conclusion' }
  ];

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-9 order-2 lg:order-1">
          {/* Title & Description */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              {authorProfile ? (
                <span className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span>{authorProfile.display_name || authorProfile.email}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Author
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                10 min read
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Technical Guide
              </span>
            </div>
            
            {article.description && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.description}
              </p>
            )}
          </div>
          
          {/* Featured Image */}
          {article.featured_image && (
            <div className="aspect-[2/1] overflow-hidden rounded-lg mb-8">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Main Content */}
          <div className="prose prose-code:bg-gray-100 prose-code:p-0.5 prose-code:rounded prose-code:before:hidden prose-code:after:hidden prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:scroll-mt-20 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="sticky top-8 space-y-8">
            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav>
                <ul className="space-y-2 text-sm">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`} 
                        className="text-gray-600 hover:text-gray-900 hover:underline flex items-center"
                      >
                        <LinkIcon className="h-3 w-3 mr-2 text-gray-400" />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            {/* Resources */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Official Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Community Forum
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
