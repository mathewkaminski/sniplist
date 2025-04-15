
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Snippet } from "./types";

export const useSniplistPlayback = (sniplistId: string) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const isMounted = useRef(true);
  const shouldAdvance = useRef(false);
  const snippetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (snippetTimer.current) {
        clearTimeout(snippetTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchSniplistItems();
  }, [sniplistId]);

  useEffect(() => {
    if (shouldAdvance.current) {
      shouldAdvance.current = false;
      advanceToNextSnippet();
    }
  }, [currentSnippetIndex, snippets.length]);

  useEffect(() => {
    // Clear previous timer when changing snippets or when playlist completes
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }

    // Only set a new timer if the playlist isn't complete
    if (!playlistComplete && snippets.length > 0) {
      console.log(`Setting timer for snippet ${currentSnippetIndex + 1} of ${snippets.length}`);
      
      snippetTimer.current = setTimeout(() => {
        console.log("20 seconds elapsed, advancing to next snippet");
        advanceToNextSnippet();
      }, 20000);

      return () => {
        if (snippetTimer.current) {
          clearTimeout(snippetTimer.current);
        }
      };
    }
  }, [currentSnippetIndex, playlistComplete, snippets.length]);

  const advanceToNextSnippet = () => {
    console.log(`Advancing from snippet ${currentSnippetIndex} to ${currentSnippetIndex + 1}, total: ${snippets.length}`);
    
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prevIndex => prevIndex + 1);
      console.log(`Advanced to snippet ${currentSnippetIndex + 1}`);
    } else {
      console.log("Reached end of playlist");
      setPlaylistComplete(true);
      toast.success("Playlist complete!");
    }
  };

  const fetchSniplistItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sniplist_items')
        .select(`
          snippet_id,
          position,
          snippets (
            id,
            title,
            video_id,
            start_time,
            end_time,
            artist
          )
        `)
        .eq('sniplist_id', sniplistId)
        .order('position');

      if (error) throw error;

      const sortedSnippets = data
        .map(item => item.snippets as Snippet)
        .filter(Boolean);

      if (isMounted.current) {
        setSnippets(sortedSnippets);
        console.log("Fetched snippets:", sortedSnippets);
      }
    } catch (error: any) {
      console.error('Error fetching sniplist items:', error);
      toast.error(`Failed to load sniplist items: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSnippetEnd = () => {
    console.log("Snippet ended, current index:", currentSnippetIndex, "total snippets:", snippets.length);
    advanceToNextSnippet();
  };

  const handleRestartPlaylist = () => {
    setCurrentSnippetIndex(0);
    setPlaylistComplete(false);
  };

  return {
    snippets,
    loading,
    currentSnippetIndex,
    playlistComplete,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
  };
};
