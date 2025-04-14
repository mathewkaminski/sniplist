
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SnippetList } from "@/components/snippets/SnippetList";
import { EditTitleDialog } from "@/components/snippets/EditTitleDialog";

interface Snippet {
  id: string;
  title: string;
  video_id: string;
  start_time: number;
  end_time: number;
  created_at: string;
  youtube_title?: string;
}

export default function MyList() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const snippetsWithTitles = await Promise.all(
        (data || []).map(async (snippet) => {
          try {
            const youtubeTitle = await fetchVideoTitle(snippet.video_id);
            return {
              ...snippet,
              youtube_title: youtubeTitle
            };
          } catch (err) {
            console.error(`Failed to fetch title for ${snippet.video_id}:`, err);
            return {
              ...snippet,
              youtube_title: 'Untitled Video'
            };
          }
        })
      );
      
      setSnippets(snippetsWithTitles);
    } catch (error: any) {
      console.error('Error fetching snippets:', error);
      toast.error(`Failed to load snippets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSnippets(snippets.filter(snippet => snippet.id !== id));
      toast.success('Snippet deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateTitle = async () => {
    if (!editingId || !editingTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from('snippets')
        .update({ title: editingTitle.trim() })
        .eq('id', editingId);
      
      if (error) throw error;
      
      setSnippets(snippets.map(snippet => 
        snippet.id === editingId 
          ? { ...snippet, title: editingTitle.trim() }
          : snippet
      ));
      
      toast.success('Title updated successfully');
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update title:', error);
      toast.error(`Failed to update title: ${error.message}`);
    }
  };

  const openEditDialog = (snippet: Snippet) => {
    setEditingId(snippet.id);
    setEditingTitle(snippet.title);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Snippets</h1>
            {loading ? (
              <p>Loading snippets...</p>
            ) : snippets.length === 0 ? (
              <p className="text-gray-500">No snippets saved yet.</p>
            ) : (
              <SnippetList 
                snippets={snippets}
                onDelete={handleDelete}
                onEdit={openEditDialog}
              />
            )}
          </div>
        </div>
      </main>

      <EditTitleDialog
        open={dialogOpen}
        title={editingTitle}
        onOpenChange={setDialogOpen}
        onSave={handleUpdateTitle}
        onTitleChange={setEditingTitle}
      />
    </div>
  );
}
