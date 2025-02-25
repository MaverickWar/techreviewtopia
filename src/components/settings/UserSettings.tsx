
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsDialog = ({ isOpen, onClose }: UserSettingsDialogProps) => {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        setUser(user);
        
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      getUser();
    }
  }, [isOpen, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    try {
      setAvatarLoading(true);
      
      // Ensure the file extension is valid
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        throw new Error('Invalid file type. Please upload an image file (jpg, jpeg, png, or gif)');
      }

      // Create a unique file path in the user's folder
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(urlData.publicUrl);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      console.error('Error in handleAvatarUpload:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile picture and manage your account settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                {avatarUrl ? (
                  <AvatarImage 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-orange-50 file:text-orange-700
                    hover:file:bg-orange-100"
                />
                <Button 
                  onClick={handleAvatarUpload} 
                  disabled={!selectedFile || avatarLoading}
                  className="w-full"
                >
                  {avatarLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Avatar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
