
import { ArticleData } from "@/types/content";
import { AwardBanner } from "./AwardBanner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ClassicLayoutProps {
  article: ArticleData;
}

export const ClassicLayout = ({ article }: ClassicLayoutProps) => {
  // Get the award from layout_settings
  const award = article.layout_settings?.award;
  const [authorName, setAuthorName] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', article.author_id)
          .single();

        if (!error && data) {
          setAuthorName(data.display_name);
        }
      }
    };

    fetchAuthorData();
  }, [article.author_id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="relative">
        {article.featured_image ? (
          <div className="w-full h-80 md:h-96 overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
              <div className="content-container">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>
                {article.published_at && (
                  <p className="text-gray-300 mb-2">
                    Published {formatDate(article.published_at)}
                    {authorName && ` by ${authorName}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="content-container py-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
            {article.published_at && (
              <p className="text-gray-500 mb-2">
                Published {formatDate(article.published_at)}
                {authorName && ` by ${authorName}`}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="content-container py-12">
        {/* Award Banner - Added here at the top of the content */}
        <AwardBanner award={award} />
        
        {article.description && (
          <div className="text-xl text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: article.description }} />
        )}
        
        {article.content && (
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        )}
      </main>
    </div>
  );
};
