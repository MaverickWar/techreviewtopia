
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ContentType } from "@/types/navigation";

// Type guard to check if the type is valid
const isValidContentType = (type: string): type is ContentType['type'] => {
  return type === 'article' || type === 'review';
};

// Transform raw data to match ContentType
const transformContent = (rawContent: any): ContentType => {
  if (!isValidContentType(rawContent.type)) {
    throw new Error(`Invalid content type: ${rawContent.type}`);
  }

  return {
    id: rawContent.id,
    title: rawContent.title,
    description: rawContent.description,
    content: rawContent.content,
    type: rawContent.type,
    status: rawContent.status,
    featured_image: rawContent.featured_image,
    created_at: rawContent.created_at,
    author_id: rawContent.author_id,
    page_id: rawContent.page_id,
    published_at: rawContent.published_at
  };
};

export const ContentManager = () => {
  const [contentList, setContentList] = useState<ContentType[]>([]);

  const { data: contentData, isLoading, isError } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to ensure it matches ContentType
      return data.map(transformContent);
    }
  });

  useEffect(() => {
    if (contentData) {
      setContentList(contentData);
    }
  }, [contentData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading content.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Manager</h1>
        <Button asChild>
          <Link to="new">Create New Content</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your recent content.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentList.map((content) => (
            <TableRow key={content.id}>
              <TableCell className="font-medium">{content.id}</TableCell>
              <TableCell>{content.title}</TableCell>
              <TableCell>{content.type}</TableCell>
              <TableCell>{content.status}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost">
                  <Link to={`${content.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
