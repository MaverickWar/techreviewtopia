import React, { useEffect, useState } from "react";
import { ArticleData, ContentType, LayoutTemplate } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AwardBanner } from "@/components/layouts/article/AwardBanner";

export interface LayoutSettingsProps {
  article: ArticleData;
  onSave: (settings: any) => void;
  // Add the missing props
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

  useEffect(() => {
    // Update from article.layout_settings when it changes
    if (article?.layout_settings) {
      const newAwardLevel = article.layout_settings.awardLevel || 
                         article.layout_settings.award || 
                         "empty_value"; // Default to "empty_value"
      setAwardLevel(newAwardLevel);
      setShowAwards(article.layout_settings.showAwards !== undefined ? 
        article.layout_settings.showAwards : true);
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
    }
  }, [layoutSettings]);

  const handleSave = async () => {
    console.log("Saving award level:", awardLevel);
    // Convert "empty_value" back to empty string for storage if needed
    const storeAwardLevel = awardLevel === "empty_value" ? "" : awardLevel;
    
    const updatedSettings = {
      ...article.layout_settings,
      awardLevel: storeAwardLevel,
      showAwards,
      // Keep award for backward compatibility
      award: storeAwardLevel 
    };

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

  const handleChange = (value: string) => {
    console.log("Award changed to:", value);
    setAwardLevel(value);
    
    // Call the onChange handler immediately for real-time updates if provided
    if (onChange) {
      // Convert "empty_value" back to empty string for storage if needed
      const storeAwardLevel = value === "empty_value" ? "" : value;
      
      const updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        awardLevel: storeAwardLevel,
        award: storeAwardLevel, // Keep award for backward compatibility
        showAwards
      };
      onChange(updatedSettings);
    }
  };

  // Only render actual award banner preview if there is a real award (not empty_value)
  const shouldShowPreview = awardLevel && awardLevel !== "empty_value";

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Award className="h-5 w-5 text-amber-500" />
        Layout Settings
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Award Badge</label>
        <Select
          value={awardLevel || "empty_value"}
          onValueChange={handleChange}
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
      
      {/* Preview */}
      {shouldShowPreview && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <AwardBanner awardLevel={awardLevel} />
          </div>
        </div>
      )}
      
      <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
        Save Settings
      </Button>
    </div>
  );
};

export default LayoutSettings;
