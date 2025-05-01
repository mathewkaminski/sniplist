import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Snippet } from "@/types";
import { usePlaylistControl } from "./usePlaylistControl";

export const useSniplistPlayback = (sniplistId: string) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const [isCurrentSnippetPlaying, setIsCurrentSnippetPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    currentSnippetIndex: playlistCurrentSnippetIndex,
    playlistComplete: playlistCompleteState,
    isCurrentSnippetPlaying: playlistIsCurrentSnippetPlaying,
    setCurrentSnippetIndex: setPlaylistCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete: setPlaylistCompleteState,
    setSnippetPlayingStatus
  } = usePlaylistControl(snippets);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setLoading(true);
        console.log("Fetching snippets for sniplist:", sniplistId);

        const { data: sniplistItemsData, error: sniplistItemsError } = await supabase
          .from('sniplist_items')
          .select(`
            snippet_id,
            position,
            snippets:snippet_id (
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

        if (sniplistItemsError) throw sniplistItemsError;

        if (!sniplistItemsData || sniplistItemsData.length === 0) {
          console.log("No snippets found");
          setSnippets([]);
          return;
        }

        const orderedSnippets = sniplistItemsData
          .map(item => item.snippets)
          .filter(Boolean) as Snippet[];

        console.log(`Found ${orderedSnippets.length} snippets`);
        setSnippets(orderedSnippets);
      } catch (err) {
        console.error("Error fetching snippets:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch snippets'));
        toast.error("Failed to load snippets");
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [sniplistId]);

  return {
    snippets,
    loading,
    currentSnippetIndex,
    playlistComplete,
    isCurrentSnippetPlaying,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
    setSnippetPlayingStatus
  };
};
