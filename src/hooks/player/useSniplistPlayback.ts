import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Snippet } from '@/types';
import { useNetworkStatus } from './useNetworkStatus';

export function useSniplistPlayback(sniplistId: string) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const networkStatus = useNetworkStatus();

  // Fetch snippets
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('sniplist_items')
          .select(`
            snippet_id,
            position,
            snippets (
              id,
              video_id,
              start_time,
              end_time,
              title,
              comments
            )
          `)
          .eq('sniplist_id', sniplistId)
          .order('position');

        if (fetchError) throw fetchError;

        const orderedSnippets = data
          .map(item => item.snippets)
          .filter(Boolean) as Snippet[];

        setSnippets(orderedSnippets);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch snippets');
        setError(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [sniplistId]);

  // Handle network status changes
  useEffect(() => {
    if (networkStatus === 'offline') {
      setIsPlaying(false);
      toast.error('Network connection lost. Playback paused.');
    }
  }, [networkStatus]);

  const playNextSnippet = useCallback(() => {
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      toast.success('Playlist complete!');
    }
  }, [currentSnippetIndex, snippets.length]);

  const playPreviousSnippet = useCallback(() => {
    if (currentSnippetIndex > 0) {
      setCurrentSnippetIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  }, [currentSnippetIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const restart = useCallback(() => {
    setCurrentSnippetIndex(0);
    setIsPlaying(true);
  }, []);

  return {
    snippets,
    currentSnippetIndex,
    isPlaying,
    loading,
    error,
    playNextSnippet,
    playPreviousSnippet,
    togglePlay,
    restart,
  };
} 