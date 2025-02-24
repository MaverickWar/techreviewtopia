
import { Card } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";

export const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-4">
        <Card className="p-6">
          <AuthForm />
        </Card>
      </div>
    </div>
  );
};
