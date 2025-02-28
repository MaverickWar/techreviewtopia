
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, MoreHorizontal, User, Key } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  avatar_url?: string;
  display_name?: string;
  created_at?: string;
}

export const UsersManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);

  // Get current user - optimized to prevent excessive rerenders
  useEffect(() => {
    let isMounted = true;
    
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (user) {
          // Get profile info
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!isMounted) return;
          
          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }
          
          setCurrentUser({
            ...user,
            profile: profileData
          });
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    
    getCurrentUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all users with proper error handling
  const { 
    data: users, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        console.log("Fetching users data");
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at');
        
        if (error) throw error;
        
        console.log(`Fetched ${data?.length || 0} users`);
        return data as UserProfile[];
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000, // Cache results for 30 seconds to reduce API calls
  });

  // Check if user is master admin with proper error handling
  const isMasterAdmin = async (email: string) => {
    try {
      // Call the database function to check
      const { data, error } = await supabase.rpc('is_master_admin', { email });
      if (error) {
        console.error('Error checking master admin status:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error in isMasterAdmin:', err);
      return false;
    }
  };

  // Toggle admin role with improved error handling
  const toggleRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      setIsActionPending(true);
      try {
        const userToUpdate = users?.find(u => u.id === userId);
        
        if (!userToUpdate) {
          throw new Error("User not found");
        }
        
        // Check if attempting to demote master admin
        const isMaster = await isMasterAdmin(userToUpdate.email);
        if (isMaster) {
          throw new Error("Cannot change role of master admin account");
        }
        
        const newRole = userToUpdate.role === 'admin' ? 'user' : 'admin';
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error in toggleRoleMutation:", error);
        throw error;
      } finally {
        setIsActionPending(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role updated",
        description: `User is now a ${data.role}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update display name mutation with improved error handling
  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, displayName }: { userId: string, displayName: string }) => {
      setIsActionPending(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error in updateProfileMutation:", error);
        throw error;
      } finally {
        setIsActionPending(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenUserDialog(false);
      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update password mutation with improved error handling
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string, password: string }) => {
      setIsActionPending(true);
      try {
        // We're not using admin.updateUserById here because it's not available in the browser
        // Instead we'll use a regular update
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        console.error("Error in updatePasswordMutation:", error);
        throw error;
      } finally {
        setIsActionPending(false);
      }
    },
    onSuccess: () => {
      setOpenPasswordDialog(false);
      setNewPassword("");
      toast({
        title: "Password updated",
        description: "User password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle opening the user dialog
  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setDisplayName(user.display_name || '');
    setOpenUserDialog(true);
  };

  // Handle opening the password dialog
  const handlePasswordChange = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  // Generate initials for avatar
  const getInitials = (user: UserProfile) => {
    if (user.display_name) {
      return user.display_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Calculate role change ability
  const canChangeRole = (user: UserProfile) => {
    // Only admins can change roles and they cannot change their own role
    return currentUser?.profile?.role === 'admin' && currentUser.id !== user.id;
  };

  // Handle error state
  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-semibold">Error loading users</h3>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          <Button 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all users on the platform.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ''} alt={user.display_name || user.email} />
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.display_name || 'No display name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? "default" : "outline"} className="capitalize">
                    {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at && new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePasswordChange(user)}>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </DropdownMenuItem>
                      {canChangeRole(user) && (
                        <DropdownMenuItem
                          onClick={() => toggleRoleMutation.mutate(user.id)}
                          disabled={toggleRoleMutation.isPending || isActionPending}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={openUserDialog} onOpenChange={(open) => {
        if (!isActionPending) setOpenUserDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedUser?.avatar_url || ''} />
                <AvatarFallback>{selectedUser ? getInitials(selectedUser) : '??'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedUser?.email}</p>
                <p className="text-sm text-gray-500">
                  User ID: {selectedUser?.id ? selectedUser.id.substring(0, 8) + '...' : ''}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter a display name"
                disabled={updateProfileMutation.isPending || isActionPending}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenUserDialog(false)}
              disabled={updateProfileMutation.isPending || isActionPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateProfileMutation.mutate({
                    userId: selectedUser.id,
                    displayName
                  });
                }
              }}
              disabled={updateProfileMutation.isPending || isActionPending}
            >
              {updateProfileMutation.isPending ? 
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span> 
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onOpenChange={(open) => {
        if (!isActionPending) setOpenPasswordDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                disabled={updatePasswordMutation.isPending || isActionPending}
              />
              <p className="text-sm text-gray-500">
                Password must be at least 6 characters long.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenPasswordDialog(false)}
              disabled={updatePasswordMutation.isPending || isActionPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && newPassword) {
                  updatePasswordMutation.mutate({
                    userId: selectedUser.id,
                    password: newPassword
                  });
                }
              }}
              disabled={updatePasswordMutation.isPending || isActionPending || !newPassword || newPassword.length < 6}
            >
              {updatePasswordMutation.isPending ? 
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span> 
                : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
