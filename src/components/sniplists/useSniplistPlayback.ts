
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
            comments
          )
        `)
        .eq('sniplist_id', sniplistId)
        .order('position');

      if (error) throw error;

      // Extract snippets from the response
      let extractedSnippets = data
        .map(item => item.snippets as Snippet)
        .filter(Boolean);

      // Process snippets to enhance titles if needed
      const enhancedSnippets = await Promise.all(
        extractedSnippets.map(async (snippet) => {
          // Check if the title is the default format that uses timestamps
          const isDefaultTitle = snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
          
          try {
            let videoData = null;
            
            // Only fetch YouTube data if the current title is the default one
            if (isDefaultTitle) {
              videoData = await fetchVideoData(snippet.video_id);
            }
            
            return {
              ...snippet,
              // If it's a default title and we got a YouTube title, use that instead
              title: isDefaultTitle && videoData ? videoData.title : snippet.title,
              youtube_title: videoData?.title,
              uploader: videoData?.uploader
            };
          } catch (err) {
            console.error(`Failed to fetch data for ${snippet.video_id}:`, err);
            return snippet;
          }
        })
      );

      if (isMounted.current) {
        setSnippets(enhancedSnippets);
        console.log("Fetched snippets:", enhancedSnippets);
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
