
import { Search, Bell, UserRound, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
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
import { useQuery } from '@tanstack/react-query';

// News Ticker component - responsible for scrolling latest articles
const NewsTicker = () => {
  const { data: latestArticles, isLoading } = useQuery({
    queryKey: ['latest-articles-ticker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, type')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching latest articles for ticker:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If loading or no articles, show a placeholder
  if (isLoading || !latestArticles || latestArticles.length === 0) {
    return (
      <div className="text-sm overflow-hidden whitespace-nowrap">
        <span className="opacity-70">Loading latest updates...</span>
      </div>
    );
  }

  return (
    <div className="ticker-container overflow-hidden relative w-full max-w-lg">
      <div className="animate-marquee whitespace-nowrap">
        {latestArticles.map((article) => (
          <Link 
            key={article.id} 
            to={`/technology/content/${article.id}`}
            className="inline-block mr-8 hover:text-orange-400 transition-colors"
          >
            {article.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

// Memoize the profile menu to prevent unnecessary rerenders
const ProfileMenu = memo(({ 
  session, 
  loading, 
  avatarUrl, 
  onLoginClick, 
  onSettingsClick, 
  onLogout, 
  menuOpen, 
  setMenuOpen 
}: { 
  session: any; 
  loading: boolean; 
  avatarUrl: string | null; 
  onLoginClick: () => void; 
  onSettingsClick: () => void; 
  onLogout: () => void; 
  menuOpen: boolean; 
  setMenuOpen: (open: boolean) => void; 
}) => {
  const getUserInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />;
  }

  if (!session) {
    return (
      <button 
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors"
        onClick={onLoginClick}
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
                loading="lazy"
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
        <DropdownMenuItem onSelect={onSettingsClick}>
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
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// For TypeScript strict mode
ProfileMenu.displayName = 'ProfileMenu';

export const TopNav = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();

  // Use React Query for better caching and performance
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      console.log('Fetching auth session');
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Use a separate query for profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile', sessionData?.user?.id],
    queryFn: async () => {
      if (!sessionData?.user?.id) return null;
      
      console.log('Fetching user profile');
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, role')
        .eq('id', sessionData.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!sessionData?.user?.id,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      // Invalidate the query cache to refetch data on auth state change
      // This is handled by React Query automatically
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const handleSettingsClose = useCallback(() => {
    setShowSettingsDialog(false);
  }, []);

  return (
    <>
      <div className="bg-slate-900 text-white py-2">
        <div className="content-container">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link to="/breaking" className="text-sm font-medium text-orange-400 hover:text-orange-300 whitespace-nowrap">
                Breaking News:
              </Link>
              <div className="w-full overflow-hidden">
                <NewsTicker />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:text-orange-400">
                <Search size={18} />
              </button>
              <button className="p-2 hover:text-orange-400">
                <Bell size={18} />
              </button>
              <ProfileMenu
                session={sessionData}
                loading={isSessionLoading || isProfileLoading}
                avatarUrl={profileData?.avatar_url || null}
                onLoginClick={() => setShowAuthModal(true)}
                onSettingsClick={() => setShowSettingsDialog(true)}
                onLogout={handleLogout}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Only render these when needed to improve initial load performance */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showSettingsDialog && (
        <UserSettingsDialog
          isOpen={showSettingsDialog}
          onClose={handleSettingsClose}
        />
      )}
    </>
  );
};
