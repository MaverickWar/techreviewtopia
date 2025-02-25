
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { importSampleContent } from "@/utils/importSampleContent";

export const ImportContent = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importSampleContent();
      toast({
        title: "Success",
        description: "Sample content has been imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import sample content",
        variant: "destructive",
      });
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={isImporting}
      className="ml-4"
    >
      {isImporting ? "Importing..." : "Import Sample Content"}
    </Button>
  );
};
