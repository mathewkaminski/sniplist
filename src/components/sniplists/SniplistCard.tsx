
import { formatDistance } from "date-fns";
import { useState } from "react";
import { SniplistPlayer } from "./SniplistPlayer";
import { Button } from "@/components/ui/button";
import { Share, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SniplistCardProps {
  id: string;
  title: string;
  created_at: string;
  onDelete?: (id: string) => void;
}

export function SniplistCard({ id, title, created_at, onDelete }: SniplistCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleEditTitle = async () => {
    try {
      const { error } = await supabase
        .from('sniplists')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;

      toast.success('Title updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating title:', error);
      toast.error(`Failed to update title: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    onDelete(id);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/sniplists?play=${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <>
      <div 
        className="p-4 border rounded-lg hover:border-gray-400 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div 
            className="flex-grow cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-gray-500 mt-2">
              Created {formatDistance(new Date(created_at), new Date(), { addSuffix: true })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sniplist Title</DialogTitle>
            <DialogDescription>
              Enter a new title for your sniplist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTitle}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isPlaying && (
        <SniplistPlayer 
          sniplistId={id} 
          onClose={() => setIsPlaying(false)} 
        />
      )}
    </>
  );
}
