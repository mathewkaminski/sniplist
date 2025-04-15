
import { Button } from "@/components/ui/button";
import { Pencil, Trash, CheckCircle } from "lucide-react";
import { Snippet } from "./types";
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
            <TableCell className="font-medium">{snippet.title}</TableCell>
            <TableCell>{snippet.uploader || "Unknown"}</TableCell>
            <TableCell>{snippet.start_time}s</TableCell>
            <TableCell>{snippet.end_time}s</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
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
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
