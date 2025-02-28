
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleData, LayoutTemplate } from "@/types/content";

// Layout Preview Components
import { ClassicLayout } from "@/components/layouts/article/ClassicLayout";
import { MagazineLayout } from "@/components/layouts/article/MagazineLayout";
import { ReviewLayout } from "@/components/layouts/article/ReviewLayout";
import { GalleryLayout } from "@/components/layouts/article/GalleryLayout";
import { TechnicalLayout } from "@/components/layouts/article/TechnicalLayout";

interface LayoutPreviewProps {
  article: Partial<ArticleData>;
  selectedLayout: LayoutTemplate;
}

export const LayoutPreview = ({
  article,
  selectedLayout
}: LayoutPreviewProps) => {
  // Create a sample article for preview
  const previewArticle: ArticleData = {
    id: "preview",
    title: article.title || "Article Title",
    description: article.description || "Article description goes here. This is a preview of how your content will look with the selected layout.",
    content: article.content || "<p>Article content goes here.</p>",
    type: article.type || "article",
    featured_image: article.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    published_at: article.published_at || new Date().toISOString(),
    author_id: article.author_id || "author",
    layout_template: selectedLayout,
    review_details: article.review_details || [{
      id: "preview",
      content_id: "preview",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      gallery: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b"],
      product_specs: { 
        "CPU": "Intel i9", 
        "RAM": "32GB", 
        "Storage": "1TB SSD" 
      },
      overall_score: 8.5
    }],
    rating_criteria: []
  };

  return (
    <Card className="mt-6 p-4 border">
      <h3 className="text-lg font-semibold mb-4">Layout Preview</h3>
      
      <Tabs defaultValue="desktop" className="mb-4">
        <TabsList>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="desktop" className="mt-2">
          <div className="border rounded-md h-[500px] overflow-auto">
            <div className="transform scale-[0.6] origin-top-left w-[165%] h-[165%] p-4">
              {renderLayout(previewArticle, selectedLayout)}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mobile" className="mt-2">
          <div className="border rounded-md h-[500px] overflow-auto flex justify-center">
            <div className="w-[375px] transform scale-[0.8] origin-top h-[125%] overflow-auto p-2 border">
              {renderLayout(previewArticle, selectedLayout)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-sm text-gray-500 mt-2">
        This is a preview of how your content will appear with the selected layout. The actual rendering may vary slightly.
      </p>
    </Card>
  );
};

// Helper function to render the appropriate layout component
const renderLayout = (article: ArticleData, layoutTemplate: LayoutTemplate) => {
  switch (layoutTemplate) {
    case 'magazine':
      return <MagazineLayout article={article} />;
    case 'review':
      return <ReviewLayout article={article} />;
    case 'gallery':
      return <GalleryLayout article={article} />;
    case 'technical':
      return <TechnicalLayout article={article} />;
    case 'classic':
    default:
      return <ClassicLayout article={article} />;
  }
};
