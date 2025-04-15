
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditTitleDialogProps {
  open: boolean;
  title: string;
  comments?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, comments: string) => void;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
}

export function EditTitleDialog({ 
  open, 
  title, 
  comments = '',
  onOpenChange, 
  onSave, 
  onTitleChange,
  onArtistChange 
}: EditTitleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Snippet Details</DialogTitle>
          <DialogDescription>
            Update the title and comments for your snippet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter title"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">Comments</label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => onArtistChange(e.target.value)}
              placeholder="Add your comments about this snippet"
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onSave(title, comments)}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
