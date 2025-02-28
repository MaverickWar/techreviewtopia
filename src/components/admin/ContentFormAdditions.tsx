
import { LayoutSelector } from "./LayoutSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentType, LayoutTemplate } from "@/types/content";

interface ContentFormAdditionsProps {
  contentType: ContentType;
  layoutTemplate: LayoutTemplate | undefined;
  onLayoutChange: (layout: LayoutTemplate) => void;
}

export const ContentFormAdditions = ({
  contentType,
  layoutTemplate = "classic",
  onLayoutChange
}: ContentFormAdditionsProps) => {
  return (
    <Tabs defaultValue="layout" className="mt-8">
      <TabsList>
        <TabsTrigger value="layout">Layout</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="layout" className="p-4 border rounded-md mt-4">
        <LayoutSelector
          contentType={contentType}
          selectedLayout={layoutTemplate}
          onChange={(layout) => onLayoutChange(layout as LayoutTemplate)}
        />
      </TabsContent>
      
      <TabsContent value="seo" className="p-4 border rounded-md mt-4">
        <div className="text-gray-500">
          SEO settings will be available soon.
        </div>
      </TabsContent>
      
      <TabsContent value="advanced" className="p-4 border rounded-md mt-4">
        <div className="text-gray-500">
          Advanced settings will be available soon.
        </div>
      </TabsContent>
    </Tabs>
  );
};
