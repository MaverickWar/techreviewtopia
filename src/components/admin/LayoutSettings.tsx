import React, { useEffect, useState } from "react";
import { ArticleData } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface LayoutSettingsProps {
  article: ArticleData;
  onSave: (settings: any) => void;
}

const LayoutSettings: React.FC<LayoutSettingsProps> = ({ article, onSave }) => {
  const [award, setAward] = useState<string | undefined>(article.layout_settings?.award);

  useEffect(() => {
    setAward(article.layout_settings?.award);
  }, [article.layout_settings]);

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
      onSave(updatedSettings);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Layout Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Award</label>
        <input
          type="text"
          value={award}
          onChange={(e) => setAward(e.target.value)}
          className="border rounded-md p-2 w-full"
        />
      </div>
      <Button onClick={handleSave} className="bg-blue-600 text-white">
        Save Settings
      </Button>
    </div>
  );
};

export default LayoutSettings;
