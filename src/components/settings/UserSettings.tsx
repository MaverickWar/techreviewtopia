
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
}

interface UserSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsDialog = ({ isOpen, onClose }: UserSettingsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    };
    getProfile();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    // Check file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      toast({
        title: "Error",
        description: "File size must be less than 1MB",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }
    
    setSelectedFile(file);
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
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
      // Ensure the path matches our storage policy structure: avatars/{user_id}/{filename}
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading to path:', filePath); // Debug log

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError); // Debug log
        throw uploadError;
      }

      console.log('Upload successful:', data); // Debug log

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl); // Debug log

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError); // Debug log
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      console.error('Error in handleAvatarUpload:', error); // Debug log
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Profile Picture</h2>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={avatarLoading}
                  className="max-w-xs"
                />
                <p className="text-sm text-gray-500">
                  Square image, max 1MB
                </p>
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

          {/* Password Change Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
