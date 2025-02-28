
import { useState, useEffect } from "react";
import { LayoutTemplate } from "@/types/content";
import { saveContentLayout } from "@/utils/contentLayouts";

export const useContentLayout = (
  contentId: string | undefined,
  initialLayout: LayoutTemplate = "classic"
) => {
  const [layoutTemplate, setLayoutTemplate] = useState<LayoutTemplate>(initialLayout);
  const [layoutSettings, setLayoutSettings] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update the layout template
  const updateLayoutTemplate = async (newLayout: LayoutTemplate) => {
    setLayoutTemplate(newLayout);
    
    if (contentId) {
      setIsSaving(true);
      setSaveError(null);
      
      try {
        const success = await saveContentLayout(contentId, newLayout, layoutSettings);
        if (!success) {
          setSaveError("Failed to save layout template");
        }
      } catch (error) {
        console.error("Error saving layout template:", error);
        setSaveError("An error occurred while saving the layout template");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Update layout settings
  const updateLayoutSettings = async (newSettings: Record<string, any>) => {
    const updatedSettings = { ...layoutSettings, ...newSettings };
    setLayoutSettings(updatedSettings);
    
    if (contentId) {
      setIsSaving(true);
      setSaveError(null);
      
      try {
        const success = await saveContentLayout(contentId, layoutTemplate, updatedSettings);
        if (!success) {
          setSaveError("Failed to save layout settings");
        }
      } catch (error) {
        console.error("Error saving layout settings:", error);
        setSaveError("An error occurred while saving the layout settings");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return {
    layoutTemplate,
    layoutSettings,
    isSaving,
    saveError,
    updateLayoutTemplate,
    updateLayoutSettings
  };
};
