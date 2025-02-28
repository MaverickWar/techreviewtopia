
import { ReactNode } from 'react';
import { TopNav } from '../TopNav';
import { MainNav } from '../MainNav';
import { Footer } from '../Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  console.log("PageLayout rendering");
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <MainNav />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};
