
import { Button } from "@/components/ui/button";
import { Pencil, Trash, CheckCircle, ExternalLink } from "lucide-react";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Snippet } from "./types";
import { formatTimeDisplay } from "@/utils/timeFormat";
import { getYoutubeVideoUrl } from "@/utils/youtube";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  onSnippetSelect = () => {},
}: SnippetListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isSelecting && <TableHead className="w-[50px]">Select</TableHead>}
          <TableHead>Player</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Uploader</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {snippets.map((snippet) => (
          <TableRow
            key={snippet.id}
            className={isSelecting && selectedSnippets.includes(snippet.id) ? "bg-muted" : ""}
          >
            {isSelecting && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onSnippetSelect(snippet.id)}
                >
                  {selectedSnippets.includes(snippet.id) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border" />
                  )}
                </Button>
              </TableCell>
            )}
            <TableCell>
              <SnippetPlayer
                videoId={snippet.video_id}
                startTime={snippet.start_time}
                endTime={snippet.end_time}
              />
            </TableCell>
            <TableCell className="font-medium">{snippet.title}</TableCell>
            <TableCell>{snippet.uploader || "Unknown"}</TableCell>
            <TableCell>{formatTimeDisplay(snippet.start_time)}</TableCell>
            <TableCell>{formatTimeDisplay(snippet.end_time)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <FavoriteButton 
                  type="snippet" 
                  id={snippet.id} 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(snippet)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(snippet.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <a 
                  href={getYoutubeVideoUrl(snippet.video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
