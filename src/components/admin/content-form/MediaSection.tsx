
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MediaSectionProps {
  featuredImage: string | null | undefined;
  gallery: string[] | undefined;
  youtubeUrl: string | null | undefined;
  onFeaturedImageChange: (url: string | null) => void;
  onGalleryChange: (gallery: string[]) => void;
  onYoutubeUrlChange: (url: string | null) => void;
  showYoutubeInput?: boolean;
}

export const MediaSection = ({
  featuredImage,
  gallery = [],
  youtubeUrl,
  onFeaturedImageChange,
  onGalleryChange,
  onYoutubeUrlChange,
  showYoutubeInput = false
}: MediaSectionProps) => {
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (type === 'featured') {
        onFeaturedImageChange(publicUrl);
      } else {
        onGalleryChange([...gallery, publicUrl]);
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Image removal handler
  const handleRemoveImage = (index: number) => {
    onGalleryChange(gallery.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Featured Image</label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('featured-image')?.click()}
            disabled={imageUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
          <input
            id="featured-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, 'featured')}
          />
          {featuredImage && (
            <div className="relative">
              <img
                src={featuredImage}
                alt="Featured"
                className="h-20 w-20 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => onFeaturedImageChange(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* YouTube URL */}
      {showYoutubeInput && (
        <div>
          <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl || ''}
            onChange={(e) => onYoutubeUrlChange(e.target.value || null)}
          />
        </div>
      )}

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium mb-2">Gallery</label>
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('gallery-image')?.click()}
            disabled={imageUploading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Gallery
          </Button>
          <input
            id="gallery-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, 'gallery')}
          />
          {gallery && gallery.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="h-24 w-full object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
