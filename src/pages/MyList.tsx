import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Snippet } from "@/components/snippets/types";
import { EditTitleDialog } from "@/components/snippets/EditTitleDialog";
import { CreateSniplistDialog } from "@/components/snippets/CreateSniplistDialog";
import { MySnippetsList } from "@/components/snippets/MySnippetsList";
import { fetchVideoTitle } from "@/utils/youtube";

export default function MyList() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingArtist, setEditingArtist] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([]);
  const [createSniplistOpen, setCreateSniplistOpen] = useState(false);

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
          const isDefaultTitle = snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
          
          try {
            let youtubeTitle = null;
            
            if (isDefaultTitle) {
              youtubeTitle = await fetchVideoTitle(snippet.video_id);
            }
            
            return {
              ...snippet,
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

  const handleCreateSniplistSuccess = () => {
    setIsSelecting(false);
    setSelectedSnippets([]);
  };

  const toggleSnippetSelection = (id: string) => {
    setSelectedSnippets(prev => 
      prev.includes(id) 
        ? prev.filter(snippetId => snippetId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MySnippetsList 
          snippets={snippets}
          loading={loading}
          onDelete={handleDelete}
          onEdit={openEditDialog}
          isSelecting={isSelecting}
          selectedSnippets={selectedSnippets}
          onSnippetSelect={toggleSnippetSelection}
          onCreateSniplist={() => setCreateSniplistOpen(true)}
          onCancelSelection={() => {
            setIsSelecting(false);
            setSelectedSnippets([]);
          }}
          onStartSelection={() => setIsSelecting(true)}
        />
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

      <CreateSniplistDialog
        open={createSniplistOpen}
        onOpenChange={setCreateSniplistOpen}
        selectedSnippets={selectedSnippets}
        onSuccess={handleCreateSniplistSuccess}
      />
    </div>
  );
}
