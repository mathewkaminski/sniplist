
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { formatDistance } from "date-fns";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Snippet {
  id: string;
  title: string;
  video_id: string;
  start_time: number;
  end_time: number;
  created_at: string;
  youtube_title?: string;
}

interface SnippetListProps {
  snippets: Snippet[];
  onDelete: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
}

export function SnippetList({ snippets, onDelete, onEdit }: SnippetListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Audio</TableHead>
          <TableHead>Time Range</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {snippets.map((snippet) => (
          <TableRow key={snippet.id}>
            <TableCell className="font-medium max-w-xs">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate" title={snippet.title}>
                    {snippet.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {snippet.title}
                </TooltipContent>
              </Tooltip>
              {snippet.youtube_title && snippet.youtube_title !== 'Untitled Video' && (
                <div className="text-xs text-gray-500 truncate">
                  From: {snippet.youtube_title}
                </div>
              )}
            </TableCell>
            <TableCell>
              <SnippetPlayer 
                videoId={snippet.video_id}
                startTime={snippet.start_time}
                endTime={snippet.end_time}
              />
            </TableCell>
            <TableCell>{`${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`}</TableCell>
            <TableCell>
              {formatDistance(new Date(snippet.created_at), new Date(), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(snippet)}
              >
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(snippet.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
