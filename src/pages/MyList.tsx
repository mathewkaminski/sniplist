
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SnippetList } from "@/components/snippets/SnippetList";
import { EditTitleDialog } from "@/components/snippets/EditTitleDialog";
import { fetchVideoTitle } from "@/utils/youtube";

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

export default function MyList() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingArtist, setEditingArtist] = useState("");
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

      // Only fetch YouTube titles for snippets that don't have a custom title set
      const snippetsWithTitles = await Promise.all(
        (data || []).map(async (snippet) => {
          // If the title is just showing time range, it's likely a default title
          const isDefaultTitle = snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
          
          try {
            const youtubeTitle = isDefaultTitle ? await fetchVideoTitle(snippet.video_id) : null;
            return {
              ...snippet,
              // If it's a default title and we got a YouTube title, use that
              title: isDefaultTitle && youtubeTitle ? youtubeTitle : snippet.title,
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

  const handleUpdateDetails = async (newTitle: string, newArtist: string) => {
    if (!editingId || !newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from('snippets')
        .update({ 
          title: newTitle.trim(),
          artist: newArtist.trim() || null
        })
        .eq('id', editingId);
      
      if (error) throw error;
      
      setSnippets(snippets.map(snippet => 
        snippet.id === editingId 
          ? { ...snippet, title: newTitle.trim(), artist: newArtist.trim() || null }
          : snippet
      ));
      
      toast.success('Snippet details updated successfully');
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update snippet details:', error);
      toast.error(`Failed to update details: ${error.message}`);
    }
  };

  const openEditDialog = (snippet: Snippet) => {
    setEditingId(snippet.id);
    setEditingTitle(snippet.title);
    setEditingArtist(snippet.artist || '');
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
        artist={editingArtist}
        onOpenChange={setDialogOpen}
        onSave={handleUpdateDetails}
        onTitleChange={setEditingTitle}
        onArtistChange={setEditingArtist}
      />
    </div>
  );
}
