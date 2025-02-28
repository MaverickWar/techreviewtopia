
import { Search, Bell, UserRound, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AuthModal } from './auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSettingsDialog } from './settings/UserSettings';

export const TopNav = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('TopNav: Error fetching profile:', error);
        return;
      }

      // Only update avatar URL if it's different from current
      if (profile?.avatar_url !== avatarUrl) {
        console.log('Setting avatar URL:', profile?.avatar_url);
        setAvatarUrl(profile?.avatar_url || null);
      }
    } catch (error) {
      console.error('TopNav: Error in fetchProfile:', error);
    }
  }, [avatarUrl]);

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        console.log('Setting up auth in TopNav');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('TopNav: Error in setupAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log('Auth state changed, new session:', currentSession ? 'yes' : 'no');
      if (mounted) {
        setSession(currentSession);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setAvatarUrl(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAvatarUrl(null);
      setSession(null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  const renderProfileMenu = () => {
    if (loading) {
      return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />;
    }

    if (!session) {
      return (
        <button 
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors"
          onClick={() => setShowAuthModal(true)}
        >
          <UserRound size={18} />
          <span>Login</span>
        </button>
      );
    }

    return (
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <Avatar className="h-8 w-8 bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer">
              {avatarUrl ? (
                <AvatarImage 
                  src={avatarUrl}
                  alt="Profile"
                  className="object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <AvatarFallback>
                  {getUserInitials(session?.user?.email)}
                </AvatarFallback>
              )}
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white z-50">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowSettingsDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <span className="ml-auto text-xs text-muted-foreground">Upload avatar</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleSettingsClose = useCallback(() => {
    setShowSettingsDialog(false);
    // Refresh the avatar after settings dialog closes
    if (session?.user) {
      fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  return (
    <>
      <div className="bg-slate-900 text-white py-2">
        <div className="content-container">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 text-sm">
              <Link to="/breaking" className="hover:text-orange-400">Breaking News</Link>
              <Link to="/newsletter" className="hover:text-orange-400">Newsletter</Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:text-orange-400">
                <Search size={18} />
              </button>
              <button className="p-2 hover:text-orange-400">
                <Bell size={18} />
              </button>
              {renderProfileMenu()}
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <UserSettingsDialog
        isOpen={showSettingsDialog}
        onClose={handleSettingsClose}
      />
    </>
  );
};
