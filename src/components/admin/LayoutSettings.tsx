import React, { useEffect, useState } from "react";
import { ArticleData, ContentType, LayoutTemplate } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Columns, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image,
  Layers
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AwardBanner } from "@/components/layouts/article/AwardBanner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export interface LayoutSettingsProps {
  article: ArticleData;
  onSave: (settings: any) => void;
  layoutTemplate?: LayoutTemplate;
  contentType?: ContentType;
  layoutSettings?: Record<string, any>;
  onChange?: (settings: Record<string, any>) => void;
}

// Predefined award options to ensure consistency
const AWARD_OPTIONS = [
  { value: "empty_value", label: "No Award" }, // Changed empty string to "empty_value"
  { value: "editors-choice", label: "Editor's Choice" },
  { value: "best-value", label: "Best Value" },
  { value: "best-performance", label: "Best Performance" },
  { value: "highly-recommended", label: "Highly Recommended" },
  { value: "budget-pick", label: "Budget Pick" },
  { value: "premium-choice", label: "Premium Choice" },
  { value: "most-innovative", label: "Most Innovative" },
];

// Transform kebab-case to readable format
const formatAwardLabel = (awardValue: string): string => {
  if (!awardValue || awardValue === "empty_value") return "";
  
  // Find the matching label from options
  const option = AWARD_OPTIONS.find(opt => opt.value === awardValue);
  return option ? option.label : awardValue
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const LayoutSettings: React.FC<LayoutSettingsProps> = ({ 
  article, 
  onSave,
  layoutSettings,
  onChange 
}) => {
  // Use awardLevel as the primary key with fallback to award for backward compatibility
  const [awardLevel, setAwardLevel] = useState<string | undefined>(
    layoutSettings?.awardLevel || 
    layoutSettings?.award || 
    article?.layout_settings?.awardLevel ||
    article?.layout_settings?.award ||
    "empty_value" // Default to "empty_value" instead of empty string
  );
  
  const [showAwards, setShowAwards] = useState<boolean>(
    layoutSettings?.showAwards !== undefined ? 
    layoutSettings.showAwards :
    article?.layout_settings?.showAwards !== undefined ?
    article.layout_settings.showAwards : 
    true
  );

  // Text alignment settings
  const [contentAlignment, setContentAlignment] = useState<string>(
    layoutSettings?.contentAlignment || 
    article?.layout_settings?.contentAlignment || 
    "left"
  );

  // Feature image settings
  const [showFeaturedImage, setShowFeaturedImage] = useState<boolean>(
    layoutSettings?.showFeaturedImage !== undefined ? 
    layoutSettings.showFeaturedImage :
    article?.layout_settings?.showFeaturedImage !== undefined ?
    article.layout_settings.showFeaturedImage : 
    true
  );

  // Layout width settings
  const [layoutWidth, setLayoutWidth] = useState<string>(
    layoutSettings?.layoutWidth || 
    article?.layout_settings?.layoutWidth || 
    "standard"
  );

  // Show table of contents (for technical articles)
  const [showTableOfContents, setShowTableOfContents] = useState<boolean>(
    layoutSettings?.showTableOfContents !== undefined ? 
    layoutSettings.showTableOfContents :
    article?.layout_settings?.showTableOfContents !== undefined ?
    article.layout_settings.showTableOfContents : 
    false
  );

  useEffect(() => {
    // Update from article.layout_settings when it changes
    if (article?.layout_settings) {
      const newAwardLevel = article.layout_settings.awardLevel || 
                         article.layout_settings.award || 
                         "empty_value"; // Default to "empty_value"
      setAwardLevel(newAwardLevel);
      setShowAwards(article.layout_settings.showAwards !== undefined ? 
        article.layout_settings.showAwards : true);
      setContentAlignment(article.layout_settings.contentAlignment || "left");
      setShowFeaturedImage(article.layout_settings.showFeaturedImage !== undefined ?
        article.layout_settings.showFeaturedImage : true);
      setLayoutWidth(article.layout_settings.layoutWidth || "standard");
      setShowTableOfContents(article.layout_settings.showTableOfContents !== undefined ?
        article.layout_settings.showTableOfContents : false);
    }
  }, [article?.layout_settings]);

  useEffect(() => {
    // Update from layoutSettings prop when it changes
    if (layoutSettings) {
      const newAwardLevel = layoutSettings.awardLevel || 
                         layoutSettings.award || 
                         "empty_value"; // Default to "empty_value"
      setAwardLevel(newAwardLevel);
      setShowAwards(layoutSettings.showAwards !== undefined ? 
        layoutSettings.showAwards : true);
      setContentAlignment(layoutSettings.contentAlignment || "left");
      setShowFeaturedImage(layoutSettings.showFeaturedImage !== undefined ?
        layoutSettings.showFeaturedImage : true);
      setLayoutWidth(layoutSettings.layoutWidth || "standard");
      setShowTableOfContents(layoutSettings.showTableOfContents !== undefined ?
        layoutSettings.showTableOfContents : false);
    }
  }, [layoutSettings]);

  const handleSave = async () => {
    console.log("Saving layout settings");
    // Convert "empty_value" back to empty string for storage if needed
    const storeAwardLevel = awardLevel === "empty_value" ? "" : awardLevel;
    
    const updatedSettings = {
      ...article.layout_settings,
      awardLevel: storeAwardLevel,
      showAwards,
      // Keep award for backward compatibility
      award: storeAwardLevel,
      // Add additional layout settings
      contentAlignment,
      showFeaturedImage,
      layoutWidth,
      showTableOfContents
    };

    console.log("Updated settings:", updatedSettings);

    // Save the updated layout settings to the database
    const { error } = await supabase
      .from('content')
      .update({ layout_settings: updatedSettings })
      .eq('id', article.id);

    if (error) {
      console.error("Error updating layout settings:", error);
    } else {
      if (onChange) {
        // Call the new onChange handler if provided
        onChange(updatedSettings);
      }
      onSave(updatedSettings);
    }
  };

  const handleChange = (setting: string, value: any) => {
    console.log(`Setting ${setting} changed to:`, value);
    
    let updatedSettings: Record<string, any> = {};
    
    // Handle special case for award
    if (setting === 'award') {
      const storeAwardLevel = value === "empty_value" ? "" : value;
      setAwardLevel(value);
      updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        awardLevel: storeAwardLevel,
        award: storeAwardLevel, // Keep award for backward compatibility
        showAwards
      };
    } else {
      // Handle other settings
      switch(setting) {
        case 'showAwards':
          setShowAwards(value);
          break;
        case 'contentAlignment':
          setContentAlignment(value);
          break;
        case 'showFeaturedImage':
          setShowFeaturedImage(value);
          break;
        case 'layoutWidth':
          setLayoutWidth(value);
          break;
        case 'showTableOfContents':
          setShowTableOfContents(value);
          break;
      }
      
      // Create the updated settings object
      updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        awardLevel: awardLevel === "empty_value" ? "" : awardLevel,
        award: awardLevel === "empty_value" ? "" : awardLevel,
        showAwards,
        contentAlignment,
        showFeaturedImage,
        layoutWidth,
        showTableOfContents,
        [setting]: value
      };
    }
    
    // Call the onChange handler immediately for real-time updates if provided
    if (onChange) {
      onChange(updatedSettings);
    }
  };

  // Only render actual award banner preview if there is a real award (not empty_value)
  const shouldShowPreview = awardLevel && awardLevel !== "empty_value";

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Layers className="h-5 w-5 text-blue-500" />
        Layout Settings
      </h2>
      
      <Tabs defaultValue="awards" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="awards" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>Awards</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Columns className="h-4 w-4" />
            <span>Layout</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <AlignLeft className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="awards" className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Award Badge</label>
            <Select
              value={awardLevel || "empty_value"}
              onValueChange={(value) => handleChange('award', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an award" />
              </SelectTrigger>
              <SelectContent>
                {AWARD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              If an award is given, it will appear as a banner at the top of the article
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Show Awards</label>
              <p className="text-xs text-gray-500">
                Toggle the visibility of award badges on this article
              </p>
            </div>
            <Switch 
              checked={showAwards} 
              onCheckedChange={(checked) => handleChange('showAwards', checked)} 
            />
          </div>
          
          {/* Preview */}
          {shouldShowPreview && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                <AwardBanner awardLevel={awardLevel} />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Layout Width</label>
            <Select
              value={layoutWidth}
              onValueChange={(value) => handleChange('layoutWidth', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Controls the maximum width of the content area
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Featured Image</label>
              <p className="text-xs text-gray-500">
                Show or hide the featured image at the top of the article
              </p>
            </div>
            <Switch 
              checked={showFeaturedImage} 
              onCheckedChange={(checked) => handleChange('showFeaturedImage', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Table of Contents</label>
              <p className="text-xs text-gray-500">
                Automatically generate a table of contents from headings
              </p>
            </div>
            <Switch 
              checked={showTableOfContents} 
              onCheckedChange={(checked) => handleChange('showTableOfContents', checked)} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Text Alignment</label>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'left')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Left align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'center')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Center align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'right')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Right align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Controls the text alignment in the main content area
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
        Save Settings
      </Button>
    </div>
  );
};

export default LayoutSettings;
