
import { ArticleData, LayoutTemplate } from "@/types/content";
import { LayoutSelector } from "../LayoutSelector";
import { LayoutPreview } from "../LayoutPreview";
import LayoutSettings from "../LayoutSettings";
import { ContentType } from "@/types/content";

interface LayoutSectionWrapperProps {
  contentType: ContentType;
  layoutTemplate: LayoutTemplate;
  layoutSettings: Record<string, any>;
  previewArticle: ArticleData;
  onLayoutChange: (layout: string) => void;
  onLayoutSettingsChange: (settings: Record<string, any>) => void;
  onLayoutSettingsSave: (settings: Record<string, any>) => void;
}

export const LayoutSectionWrapper = ({
  contentType,
  layoutTemplate,
  layoutSettings,
  previewArticle,
  onLayoutChange,
  onLayoutSettingsChange,
  onLayoutSettingsSave
}: LayoutSectionWrapperProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-4">
          Choose a layout template to determine how your content will be displayed to readers.
          Each layout is optimized for different types of content.
        </p>
      
        <LayoutSelector
          contentType={contentType}
          selectedLayout={layoutTemplate}
          onChange={onLayoutChange}
        />
      </div>
      
      <LayoutSettings
        article={previewArticle}
        onSave={onLayoutSettingsSave}
        layoutTemplate={layoutTemplate}
        contentType={contentType}
        layoutSettings={layoutSettings}
        onChange={onLayoutSettingsChange}
      />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Preview</h3>
        <div className="border rounded-lg overflow-hidden">
          <LayoutPreview
            article={previewArticle}
            selectedLayout={layoutTemplate}
          />
        </div>
        <p className="text-xs text-gray-500 italic mt-2">
          This is a preview of how your content will appear with the selected layout. The actual rendering may vary slightly.
        </p>
      </div>
    </div>
  );
};
