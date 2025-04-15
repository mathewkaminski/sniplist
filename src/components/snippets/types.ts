
export interface Snippet {
  id: string;
  title: string;
  comments?: string;
  video_id: string;
  start_time: number;
  end_time: number;
  created_at: string;
  youtube_title?: string;
  uploader?: string;
}

export interface SnippetListProps {
  snippets: Snippet[];
  onDelete: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  isSelecting?: boolean;
  selectedSnippets?: string[];
  onSnippetSelect?: (id: string) => void;
}
