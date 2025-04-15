
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateSniplistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSnippets: string[];
  onSuccess: () => void;
}

export function CreateSniplistDialog({
  open,
  onOpenChange,
  selectedSnippets,
  onSuccess,
}: CreateSniplistDialogProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your Sniplist");
      return;
    }

    try {
      setLoading(true);

      // Create the sniplist
      const { data: sniplist, error: sniplistError } = await supabase
        .from('sniplists')
        .insert({ title: title.trim() })
        .select()
        .single();

      if (sniplistError) throw sniplistError;

      // Add the selected snippets to the sniplist
      const snippetItems = selectedSnippets.map((snippetId, index) => ({
        sniplist_id: sniplist.id,
        snippet_id: snippetId,
        position: index,
      }));

      const { error: itemsError } = await supabase
        .from('sniplist_items')
        .insert(snippetItems);

      if (itemsError) throw itemsError;

      toast.success("Sniplist created successfully!");
      onSuccess();
      onOpenChange(false);
      setTitle("");
    } catch (error: any) {
      console.error('Error creating sniplist:', error);
      toast.error(`Failed to create sniplist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Sniplist</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter sniplist title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            Create Sniplist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
