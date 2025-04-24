
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Snippet } from "./types";
import { fetchVideoData } from "@/utils/youtube";

export const useSniplistPlayback = (sniplistId: string) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const [isCurrentSnippetPlaying, setIsCurrentSnippetPlaying] = useState(false);
  const isMounted = useRef(true);
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
    if (!sniplistId) {
      console.error("No sniplist ID provided");
      return;
    }
    fetchSniplistItems();
  }, [sniplistId]);

  const fetchSniplistItems = async () => {
    try {
      setLoading(true);
      console.log("🎵 Fetching snippets for sniplist:", sniplistId);
      
      // Get all snippet IDs for this sniplist with their positions
      const { data: sniplistItemsData, error: sniplistItemsError } = await supabase
        .from('sniplist_items')
        .select('snippet_id, position')
        .eq('sniplist_id', sniplistId)
        .order('position');

      if (sniplistItemsError) {
        console.error("Error fetching sniplist items:", sniplistItemsError);
        toast.error("Failed to load sniplist items");
        setLoading(false);
        return;
      }

      if (!sniplistItemsData || sniplistItemsData.length === 0) {
        console.log("No items found in sniplist:", sniplistId);
        setSnippets([]);
        setLoading(false);
        return;
      }

      const snippetIds = sniplistItemsData.map(item => item.snippet_id);
      
      // Fetch the actual snippets
      const { data: snippetsData, error: snippetsError } = await supabase
        .from('snippets')
        .select('*')
        .in('id', snippetIds);

      if (snippetsError) {
        console.error("Error fetching snippets:", snippetsError);
        toast.error("Failed to load snippets");
        setLoading(false);
        return;
      }

      if (!snippetsData || snippetsData.length === 0) {
        console.log("No snippets found for IDs:", snippetIds);
        setSnippets([]);
        setLoading(false);
        return;
      }

      // Order snippets according to sniplist_items positions
      const orderedSnippets = sniplistItemsData
        .map(item => {
          const snippet = snippetsData.find(s => s.id === item.snippet_id);
          return snippet ? { ...snippet, sniplist_id: sniplistId } : null;
        })
        .filter(Boolean) as Snippet[];

      // Enhance snippets with YouTube data
      const enhancedSnippets = await Promise.all(
        orderedSnippets.map(async (snippet) => {
          if (!snippet) return null;
          
          const isDefaultTitle = snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
          
          try {
            let videoData = null;
            if (isDefaultTitle) {
              videoData = await fetchVideoData(snippet.video_id);
            }
            
            return {
              ...snippet,
              title: isDefaultTitle && videoData ? videoData.title : snippet.title,
              youtube_title: videoData?.title,
              uploader: videoData?.uploader,
              sniplist_id: sniplistId
            };
          } catch (err) {
            console.error(`Failed to fetch data for ${snippet.video_id}:`, err);
            return snippet;
          }
        })
      );

      const finalSnippets = enhancedSnippets.filter(Boolean) as Snippet[];
      
      if (isMounted.current) {
        console.log(`Successfully loaded ${finalSnippets.length} snippets`);
        setSnippets(finalSnippets);
      }
    } catch (error: any) {
      console.error('Error in fetchSniplistItems:', error);
      toast.error(`Failed to load sniplist: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Reset timer when a snippet starts playing
  useEffect(() => {
    if (isCurrentSnippetPlaying && snippets.length > 0) {
      console.log(`Snippet ${currentSnippetIndex + 1} is actively playing now, managing playback timer`);
      resetSnippetTimer();
      
      return () => {
        if (snippetTimer.current) {
          clearTimeout(snippetTimer.current);
          snippetTimer.current = null;
        }
      };
    }
  }, [isCurrentSnippetPlaying, currentSnippetIndex]);
  
  // Clear existing timer and set a new one for the current snippet
  const resetSnippetTimer = () => {
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }

    if (!playlistComplete && snippets.length > 0) {
      const currentSnippet = snippets[currentSnippetIndex];
      if (!currentSnippet) return;
      
      const snippetDuration = currentSnippet.end_time - currentSnippet.start_time;
      const timeoutDuration = Math.max(snippetDuration * 1000, 5000); // Use actual duration or minimum 5 seconds
      
      console.log(`Setting timer for snippet ${currentSnippetIndex + 1} of ${snippets.length}, duration: ${timeoutDuration}ms`);
      
      snippetTimer.current = setTimeout(() => {
        console.log(`Snippet ${currentSnippetIndex + 1} timer elapsed, advancing...`);
        advanceToNextSnippet();
      }, timeoutDuration + 1000); // Add 1 second buffer
    }
  };

  const advanceToNextSnippet = () => {
    console.log(`Advancing from snippet ${currentSnippetIndex} to ${currentSnippetIndex + 1}, total: ${snippets.length}`);
    
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prevIndex => prevIndex + 1);
      setIsCurrentSnippetPlaying(false); // Reset play state for new snippet
      console.log(`Advanced to snippet ${currentSnippetIndex + 1}`);
    } else {
      console.log("Reached end of playlist");
      setPlaylistComplete(true);
      toast.success("Playlist complete!");
    }
  };

  const handleSnippetEnd = () => {
    console.log("Snippet ended naturally, current index:", currentSnippetIndex);
    advanceToNextSnippet();
  };

  const handleRestartPlaylist = () => {
    setCurrentSnippetIndex(0);
    setPlaylistComplete(false);
    setIsCurrentSnippetPlaying(false);
  };

  const setSnippetPlayingStatus = (isPlaying: boolean) => {
    console.log(`Setting snippet ${currentSnippetIndex + 1} playing status to: ${isPlaying}`);
    setIsCurrentSnippetPlaying(isPlaying);
  };

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
