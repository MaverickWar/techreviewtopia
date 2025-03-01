
import { ReactNode, useEffect } from 'react';
import { TopNav } from '../TopNav';
import { MainNav } from '../MainNav';
import { Footer } from '../Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  console.log("📄 PageLayout rendering start");
  
  useEffect(() => {
    console.log("📄 PageLayout mounted");
    return () => {
      console.log("📄 PageLayout unmounted");
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <MainNav />
      <main className="pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};
