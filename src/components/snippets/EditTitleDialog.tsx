
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditTitleDialogProps {
  open: boolean;
  title: string;
  artist?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, artist: string) => void;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
}

export function EditTitleDialog({ 
  open, 
  title, 
  artist = '',
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
            Update the title and artist for your snippet.
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
            <label htmlFor="artist" className="text-sm font-medium">Artist</label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => onArtistChange(e.target.value)}
              placeholder="Enter artist name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onSave(title, artist)}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
