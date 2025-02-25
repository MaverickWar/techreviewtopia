
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  mode?: 'login' | 'register';
  onModeChange?: Dispatch<SetStateAction<'login' | 'register'>>;
  onClose?: () => void;
}

export const AuthForm = ({ mode = 'login', onModeChange, onClose }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Debug: Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Current session:", session);
      if (error) console.error("Session check error:", error);
      
      // Clear any existing session
      if (session) {
        console.log("Clearing existing session...");
        await supabase.auth.signOut();
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting auth operation:", mode);

    try {
      if (mode === 'register') {
        console.log("Starting registration for:", email);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });

        console.log("Sign up response:", { data: signUpData, error: signUpError });

        if (signUpError) {
          // Handle the "User already registered" error specifically
          if (signUpError.message === "User already registered") {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
            onModeChange?.('login');
            setIsLoading(false);
            return;
          }
          throw signUpError;
        }

        if (signUpData.user) {
          console.log("Creating profile for user:", signUpData.user.id);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: signUpData.user.id, 
              email, 
              role: 'user' 
            }]);

          console.log("Profile creation result:", { error: profileError });
          
          if (profileError) throw profileError;
        }

        toast({
          title: "Account created",
          description: "Please check your email for verification.",
        });
        
        if (onClose) onClose();
      } else {
        console.log("Attempting login for:", email);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Sign in response:", { data: signInData, error: signInError });

        if (signInError) {
          const errorMessage = signInError.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : signInError.message;
            
          throw new Error(errorMessage);
        }

        if (!signInData.user) {
          throw new Error("Login failed - no user data returned");
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{mode === 'register' ? "Sign Up" : "Login"}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === 'register'
            ? "Create an account to continue"
            : "Welcome back! Please log in to continue"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : mode === 'register' ? "Sign Up" : "Login"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          className="text-blue-500 hover:underline"
          onClick={() => onModeChange?.(mode === 'register' ? 'login' : 'register')}
        >
          {mode === 'register'
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};
