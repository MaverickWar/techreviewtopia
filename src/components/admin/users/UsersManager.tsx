
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, MoreHorizontal, Mail, AlertTriangle, User, Key } from "lucide-react";

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

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setCurrentUser({
          ...user,
          profile: profileData
        });
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch all users
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  // Toggle admin role
  const toggleRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const userToUpdate = users?.find(u => u.id === userId);
      
      if (!userToUpdate) {
        throw new Error("User not found");
      }
      
      // Check if attempting to demote master admin
      if (await isMasterAdmin(userToUpdate.email)) {
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

  // Update display name mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, displayName }: { userId: string, displayName: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string, password: string }) => {
      // Use Supabase admin API to update password
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (error) throw error;
      return { success: true };
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

  // Check if user is master admin
  const isMasterAdmin = async (email: string) => {
    // Call the database function to check
    const { data, error } = await supabase.rpc('is_master_admin', { email });
    if (error) {
      console.error('Error checking master admin status:', error);
      return false;
    }
    return data;
  };

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
        .toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Calculate role change ability
  const canChangeRole = (user: UserProfile) => {
    // Only admins can change roles and they cannot change their own role
    return currentUser?.profile?.role === 'admin' && currentUser.id !== user.id;
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    return <div>Error loading users.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
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
                        disabled={toggleRoleMutation.isPending}
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

      {/* Edit Profile Dialog */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
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
                  User ID: {selectedUser?.id.substring(0, 8)}...
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
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenUserDialog(false)}
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
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
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
              disabled={updatePasswordMutation.isPending || !newPassword || newPassword.length < 6}
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
