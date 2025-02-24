
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { AuthForm } from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({
  isOpen,
  onClose
}: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in or create an account to continue
        </DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-5 h-[600px]">
          {/* Left Panel - Image */}
          <div className="relative col-span-2 hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
              alt="Featured Tech" 
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h3 className="font-bold mb-2 text-2xl text-center">iPhone 15 Pro Review</h3>
              <p className="text-gray-200 text-sm text-center">
                Discover the future of mobile photography
              </p>
            </div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="col-span-3 p-8">
            <AuthForm 
              mode={mode} 
              onModeChange={setMode} 
              onClose={onClose} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
