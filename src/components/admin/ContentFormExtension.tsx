
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutSelector } from "./LayoutSelector";
import { LayoutPreview } from "./LayoutPreview";
import { useContentLayout } from "@/hooks/useContentLayout";
import { ContentType, LayoutTemplate, ArticleData } from "@/types/content";
import { useToast } from "@/components/ui/use-toast";

interface ContentFormExtensionProps {
  contentId?: string;
  contentType: ContentType;
  contentData: Partial<ArticleData>;
  initialLayout?: LayoutTemplate;
  onSave: (layoutData: { layout_template: LayoutTemplate, layout_settings: Record<string, any> }) => void;
}

export const ContentFormExtension = ({
  contentId,
  contentType,
  contentData,
  initialLayout = "classic",
  onSave
}: ContentFormExtensionProps) => {
  const { toast } = useToast();
  const {
    layoutTemplate,
    layoutSettings,
    isSaving,
    saveError,
    updateLayoutTemplate,
    updateLayoutSettings
  } = useContentLayout(contentId, initialLayout);

  // Handle layout template change
  const handleLayoutChange = async (layout: string) => {
    await updateLayoutTemplate(layout as LayoutTemplate);
    
    // Notify parent component
    onSave({
      layout_template: layout as LayoutTemplate,
      layout_settings: layoutSettings
    });
    
    toast({
      title: "Layout updated",
      description: `Content will be displayed using the ${layout} layout.`
    });
  };

  useEffect(() => {
    if (saveError) {
      toast({
        title: "Error",
        description: saveError,
        variant: "destructive"
      });
    }
  }, [saveError, toast]);

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <Tabs defaultValue="layout">
          <TabsList>
            <TabsTrigger value="layout">Layout Template</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="advanced" disabled>Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout">
            <div className="py-4">
              <LayoutSelector
                contentType={contentType}
                selectedLayout={layoutTemplate}
                onChange={handleLayoutChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <LayoutPreview
              article={contentData}
              selectedLayout={layoutTemplate}
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="py-4">
              <p className="text-gray-500">Advanced layout settings coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
