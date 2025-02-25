
import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
}

const ContentHeader = ({ title, subtitle, category }: ContentHeaderProps) => (
  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white">
    <div className="content-container py-16">
      <div className="max-w-4xl mx-auto text-center">
        {category && (
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
            {category}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </div>
);

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
}

const ContentSection = ({ children, className }: ContentSectionProps) => (
  <section className={`py-12 ${className || ''}`}>
    <div className="content-container">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  </section>
);

interface ContentPageLayoutProps {
  children: ReactNode;
  header: ContentHeaderProps;
  className?: string;
}

export const ContentPageLayout = ({ children, header, className }: ContentPageLayoutProps) => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        <ContentHeader {...header} />
        <ContentSection className={className}>
          <article className="bg-white shadow-sm rounded-lg p-8">
            {children}
          </article>
        </ContentSection>
      </div>
    </PageLayout>
  );
};
