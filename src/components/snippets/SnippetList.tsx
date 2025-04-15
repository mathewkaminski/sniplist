
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Plus } from "lucide-react";
import { formatDistance } from "date-fns";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getYoutubeVideoUrl } from "@/utils/youtube";

interface Snippet {
  id: string;
  title: string;
  artist?: string;
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
  isSelecting?: boolean;
  selectedSnippets?: string[];
  onSnippetSelect?: (id: string) => void;
}

export function SnippetList({ 
  snippets, 
  onDelete, 
  onEdit,
  isSelecting = false,
  selectedSnippets = [],
  onSnippetSelect
}: SnippetListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isSelecting && <TableHead className="w-16">Select</TableHead>}
          <TableHead>Title</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead>Audio</TableHead>
          <TableHead>Time Range</TableHead>
          <TableHead className="w-24 text-right">Created</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {snippets.map((snippet) => (
          <TableRow key={snippet.id}>
            {isSelecting && (
              <TableCell>
                <Button
                  variant={selectedSnippets.includes(snippet.id) ? "default" : "outline"}
                  size="icon"
                  onClick={() => onSnippetSelect?.(snippet.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
            <TableCell 
              className="font-medium max-w-xs cursor-pointer hover:bg-muted/50"
              onClick={() => onEdit(snippet)}
            >
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
            </TableCell>
            <TableCell 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onEdit(snippet)}
            >
              {snippet.artist || '-'}
            </TableCell>
            <TableCell>
              <SnippetPlayer 
                videoId={snippet.video_id}
                startTime={snippet.start_time}
                endTime={snippet.end_time}
              />
            </TableCell>
            <TableCell>{`${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`}</TableCell>
            <TableCell className="w-24 text-right">
              {formatDistance(new Date(snippet.created_at), new Date(), { addSuffix: true })}
            </TableCell>
            <TableCell className="w-28 text-right">
              <div className="flex justify-end gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      asChild
                    >
                      <a 
                        href={getYoutubeVideoUrl(snippet.video_id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Open in YouTube
                  </TooltipContent>
                </Tooltip>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(snippet.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
