
interface ContentPageLayoutProps {
  children: React.ReactNode;
  header: {
    title: string;
    subtitle?: string;
  };
}

export const ContentPageLayout = ({ children, header }: ContentPageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="content-container py-8">
          <h1 className="text-3xl font-bold text-gray-900">{header.title}</h1>
          {header.subtitle && (
            <p className="mt-2 text-lg text-gray-600">{header.subtitle}</p>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
