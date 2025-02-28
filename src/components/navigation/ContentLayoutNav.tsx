
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleData, LayoutTemplate } from "@/types/content";

interface ContentLayoutNavProps {
  article: ArticleData;
  onLayoutChange?: (layout: LayoutTemplate) => void;
}

export const ContentLayoutNav = ({ article, onLayoutChange }: ContentLayoutNavProps) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutTemplate>(
    article.layout_template || "classic"
  );

  const handleLayoutChange = (layout: LayoutTemplate) => {
    setCurrentLayout(layout);
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  return (
    <div className="mb-8 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold truncate max-w-sm md:max-w-md">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <Tabs value={currentLayout} onValueChange={(v) => handleLayoutChange(v as LayoutTemplate)}>
              <TabsList className="hidden md:flex">
                <TabsTrigger value="classic">
                  Classic
                </TabsTrigger>
                <TabsTrigger value="magazine">
                  Magazine
                </TabsTrigger>
                {article.type === "review" && (
                  <TabsTrigger value="review">
                    Review
                  </TabsTrigger>
                )}
                <TabsTrigger value="gallery">
                  Gallery
                </TabsTrigger>
                {article.type === "article" && (
                  <TabsTrigger value="technical">
                    Technical
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
