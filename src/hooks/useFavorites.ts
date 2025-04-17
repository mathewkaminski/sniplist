
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useFavorites() {
  const [favoriteSnippets, setFavoriteSnippets] = useState<string[]>([]);
  const [favoriteSniplists, setFavoriteSniplists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // First, get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      const [snippetsResponse, sniplistsResponse] = await Promise.all([
        supabase.from('favorite_snippets').select('snippet_id').eq('user_id', user.id),
        supabase.from('favorite_sniplists').select('sniplist_id').eq('user_id', user.id)
      ]);

      if (snippetsResponse.error) throw snippetsResponse.error;
      if (sniplistsResponse.error) throw sniplistsResponse.error;

      setFavoriteSnippets(snippetsResponse.data.map(f => f.snippet_id));
      setFavoriteSniplists(sniplistsResponse.data.map(f => f.sniplist_id));
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavoriteSnippet = async (snippetId: string) => {
    const isFavorited = favoriteSnippets.includes(snippetId);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You need to be logged in to favorite snippets');
        return;
      }
      
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite_snippets')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippetId);
        
        if (error) throw error;
        setFavoriteSnippets(prev => prev.filter(id => id !== snippetId));
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorite_snippets')
          .insert({ 
            user_id: user.id,
            snippet_id: snippetId 
          });
        
        if (error) throw error;
        setFavoriteSnippets(prev => [...prev, snippetId]);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const toggleFavoriteSniplist = async (sniplistId: string) => {
    const isFavorited = favoriteSniplists.includes(sniplistId);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You need to be logged in to favorite sniplists');
        return;
      }
      
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite_sniplists')
          .delete()
          .eq('user_id', user.id)
          .eq('sniplist_id', sniplistId);
        
        if (error) throw error;
        setFavoriteSniplists(prev => prev.filter(id => id !== sniplistId));
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorite_sniplists')
          .insert({ 
            user_id: user.id,
            sniplist_id: sniplistId 
          });
        
        if (error) throw error;
        setFavoriteSniplists(prev => [...prev, sniplistId]);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  return {
    favoriteSnippets,
    favoriteSniplists,
    loading,
    toggleFavoriteSnippet,
    toggleFavoriteSniplist
  };
}
