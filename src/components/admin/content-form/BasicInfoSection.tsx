
import RichTextEditor from "@/components/editor/RichTextEditor";

interface BasicInfoSectionProps {
  title: string;
  description: string | null;
  content: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
}

export const BasicInfoSection = ({
  title,
  description,
  content,
  onTitleChange,
  onDescriptionChange,
  onContentChange
}: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <RichTextEditor
          content={description || ''}
          onChange={onDescriptionChange}
          placeholder="Enter a brief description..."
          minHeight="150px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <RichTextEditor
          content={content || ''}
          onChange={onContentChange}
          placeholder="Write your content here..."
          minHeight="300px"
        />
      </div>
    </div>
  );
};
