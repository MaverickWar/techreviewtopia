
import React, { useEffect, useState } from "react";
import { ArticleData, ContentType, LayoutTemplate } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export interface LayoutSettingsProps {
  article: ArticleData;
  onSave: (settings: any) => void;
  // Add the missing props
  layoutTemplate?: LayoutTemplate;
  contentType?: ContentType;
  layoutSettings?: Record<string, any>;
  onChange?: (settings: Record<string, any>) => void;
}

const LayoutSettings: React.FC<LayoutSettingsProps> = ({ 
  article, 
  onSave,
  layoutSettings,
  onChange 
}) => {
  const [award, setAward] = useState<string | undefined>(
    // Use either the new layoutSettings prop or fall back to article.layout_settings
    layoutSettings?.award || article?.layout_settings?.award
  );

  useEffect(() => {
    // Update from article.layout_settings when it changes
    if (article?.layout_settings) {
      setAward(article.layout_settings.award);
    }
  }, [article?.layout_settings]);

  useEffect(() => {
    // Update from layoutSettings prop when it changes
    if (layoutSettings) {
      setAward(layoutSettings.award);
    }
  }, [layoutSettings]);

  const handleSave = async () => {
    const updatedSettings = {
      ...article.layout_settings,
      award,
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
    setAward(value);
    
    // Call the onChange handler immediately for real-time updates if provided
    if (onChange) {
      const updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        award: value
      };
      onChange(updatedSettings);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Layout Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Award</label>
        <input
          type="text"
          value={award || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="border rounded-md p-2 w-full"
          placeholder="e.g. Editor's Choice, Best Value, Highly Recommended"
        />
        <p className="text-xs text-gray-500 mt-1">
          If an award is given, it will appear as a banner at the top of the article
        </p>
      </div>
      <Button onClick={handleSave} className="bg-blue-600 text-white">
        Save Settings
      </Button>
    </div>
  );
};

export default LayoutSettings;
