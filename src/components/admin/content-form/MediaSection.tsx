
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Image as ImageIcon, Plus, Youtube, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  showYoutubeInput = true
}: MediaSectionProps) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [videoType, setVideoType] = useState<string>("youtube");
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

  // Extract YouTube video ID
  const extractYoutubeVideoId = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };

  // Extract Vimeo video ID
  const extractVimeoVideoId = (url: string): string | null => {
    const vimeoRegex = /(?:vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/;
    const match = url.match(vimeoRegex);
    return match ? match[1] : null;
  };

  // Get embed URL based on video type
  const getEmbedUrl = (url: string, type: string): string | null => {
    if (!url) return null;
    
    switch (type) {
      case 'youtube': {
        const videoId = extractYoutubeVideoId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      case 'vimeo': {
        const videoId = extractVimeoVideoId(url);
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
      }
      case 'direct': {
        // For direct video URLs (mp4, etc.), just return the URL itself
        return url.match(/\.(mp4|webm|ogg)$/i) ? url : null;
      }
      default:
        return null;
    }
  };

  // Get preview embed URL
  const getPreviewEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    return getEmbedUrl(url, videoType);
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

      {/* Video Section */}
      {showYoutubeInput && (
        <div>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="video-type">Video Platform</Label>
              <Select
                value={videoType}
                onValueChange={(value) => {
                  setVideoType(value);
                  // Clear the URL when changing platform to avoid invalid URLs
                  onYoutubeUrlChange(null);
                }}
              >
                <SelectTrigger id="video-type" className="w-full">
                  <SelectValue placeholder="Select video platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">
                    <div className="flex items-center">
                      <Youtube className="mr-2 h-4 w-4" />
                      <span>YouTube</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vimeo">
                    <div className="flex items-center">
                      <Video className="mr-2 h-4 w-4" />
                      <span>Vimeo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="direct">
                    <div className="flex items-center">
                      <Video className="mr-2 h-4 w-4" />
                      <span>Direct Video URL</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="video-url">
                {videoType === 'youtube' ? 'YouTube Video URL' :
                 videoType === 'vimeo' ? 'Vimeo Video URL' : 'Direct Video URL'}
              </Label>
              <Input
                id="video-url"
                placeholder={
                  videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                  videoType === 'vimeo' ? 'https://vimeo.com/...' :
                  'https://example.com/video.mp4'
                }
                value={youtubeUrl || ''}
                onChange={(e) => onYoutubeUrlChange(e.target.value || null)}
              />
              <p className="text-sm text-gray-500 mt-1">
                {videoType === 'youtube' ? 'Paste a YouTube URL (watch or share link)' : 
                 videoType === 'vimeo' ? 'Paste a Vimeo URL' : 
                 'Paste a direct link to a video file (.mp4, .webm, .ogg)'}
              </p>
            </div>

            {/* Video Preview */}
            {youtubeUrl && getPreviewEmbedUrl(youtubeUrl) && (
              <div className="border border-gray-200 rounded-md p-4">
                <div className="aspect-video w-full">
                  {videoType === 'direct' ? (
                    <video 
                      src={youtubeUrl} 
                      controls 
                      className="w-full h-full rounded"
                    />
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getPreviewEmbedUrl(youtubeUrl)}
                      allowFullScreen
                      title="Video preview"
                      className="rounded"
                    ></iframe>
                  )}
                </div>
              </div>
            )}
          </div>
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
