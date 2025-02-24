
import { useState, Dispatch, SetStateAction } from "react";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Create profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: (await supabase.auth.getUser()).data.user?.id, email, role: 'user' }]);

        if (profileError) throw profileError;

        toast({
          title: "Account created",
          description: "Please check your email for verification.",
        });
        
        if (onClose) onClose();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        if (onClose) onClose();
        navigate("/admin");
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
