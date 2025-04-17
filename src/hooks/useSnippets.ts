
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Snippet } from "@/components/snippets/types";
import { fetchVideoData } from "@/utils/youtube";

export function useSnippets() {
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSnippets([]);
        return;
      }

      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const snippetsWithData = await Promise.all(
        (data || []).map(async (snippet) => {
          try {
            const videoData = await fetchVideoData(snippet.video_id);
            
            const isDefaultTitle = snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
            
            return {
              ...snippet,
              title: isDefaultTitle && videoData.title ? videoData.title : snippet.title,
              uploader: videoData.uploader
            };
          } catch (err) {
            console.error(`Failed to fetch data for ${snippet.video_id}:`, err);
            return {
              ...snippet,
              uploader: 'Unknown'
            };
          }
        })
      );
      
      setSnippets(snippetsWithData);
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

  const handleUpdateDetails = async (newTitle: string, newComments: string) => {
    if (!editingId || !newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from('snippets')
        .update({ 
          title: newTitle.trim(),
          comments: newComments.trim() || null
        })
        .eq('id', editingId);
      
      if (error) throw error;
      
      setSnippets(snippets.map(snippet => 
        snippet.id === editingId 
          ? { ...snippet, title: newTitle.trim(), comments: newComments.trim() || null }
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
    setEditingArtist(snippet.comments || '');
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

  return {
    snippets,
    loading,
    editingTitle,
    editingArtist,
    editingId,
    dialogOpen,
    isSelecting,
    selectedSnippets,
    createSniplistOpen,
    setEditingTitle,
    setEditingArtist,
    setDialogOpen,
    setCreateSniplistOpen,
    handleDelete,
    handleUpdateDetails,
    openEditDialog,
    handleCreateSniplistSuccess,
    toggleSnippetSelection,
    setIsSelecting,
    setSelectedSnippets
  };
}
