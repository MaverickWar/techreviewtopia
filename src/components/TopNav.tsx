import { Search, Bell, UserRound, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { useToast } from './ui/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';

export const TopNav = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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

  const getUserInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

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
              
              {!loading && (
                session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <Avatar className="h-8 w-8 bg-orange-500 hover:bg-orange-600 transition-colors">
                        <AvatarFallback>
                          {getUserInitials(session.user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button 
                    className="p-2 hover:text-orange-400"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <UserRound size={18} />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
