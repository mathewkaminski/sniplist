
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

  const fetchSniplistItems = async () => {
    try {
      setLoading(true);
      console.log("🎵 Fetching snippets for sniplist:", sniplistId);
      
      // First, verify sniplist exists and is accessible
      const { data: sniplistData, error: sniplistError } = await supabase
        .from('sniplists')
        .select(`
          title, 
          user_id,
          profiles:user_id (is_public)
        `)
        .eq('id', sniplistId)
        .single();

      if (sniplistError) {
        console.error("❌ Error fetching sniplist:", sniplistError);
        toast.error("Failed to access sniplist");
        setLoading(false);
        return;
      }

      console.log("✅ Sniplist found:", sniplistData);
      
      // Check if current user is the owner or if the sniplist owner's profile is public
      const { data: authData } = await supabase.auth.getUser();
      const isOwner = authData.user && authData.user.id === sniplistData.user_id;
      const isPublic = sniplistData.profiles?.is_public;
      
      if (!isOwner && !isPublic) {
        console.log("❌ Access denied: sniplist is private and user is not owner");
        toast.error("This sniplist is private");
        setLoading(false);
        return;
      }
      
      const { data: sniplistItemsData, error: sniplistItemsError } = await supabase
        .from('sniplist_items')
        .select('snippet_id, position')
        .eq('sniplist_id', sniplistId)
        .order('position');

      if (sniplistItemsError) {
        console.error("❌ Error fetching sniplist items:", sniplistItemsError);
        toast.error(`Failed to load sniplist items: ${sniplistItemsError.message}`);
        setLoading(false);
        return;
      }

      console.log("✅ Sniplist items found:", sniplistItemsData?.length || 0);
      
      if (!sniplistItemsData || sniplistItemsData.length === 0) {
        console.log("ℹ️ No items found in sniplist:", sniplistId);
        setSnippets([]);
        setLoading(false);
        toast.info("This sniplist has no snippets");
        return;
      }

      const snippetIds = sniplistItemsData.map(item => item.snippet_id);
      
      const { data: snippetsData, error: snippetsError } = await supabase
        .from('snippets')
        .select('*')
        .in('id', snippetIds);

      if (snippetsError) {
        console.error("❌ Error fetching snippets:", snippetsError);
        toast.error(`Failed to load snippets: ${snippetsError.message}`);
        setLoading(false);
        return;
      }

      console.log("✅ Fetched snippets data:", snippetsData?.length || 0);

      if (!snippetsData || snippetsData.length === 0) {
        console.log("No snippets found for the given IDs");
        setSnippets([]);
        setLoading(false);
        toast.info("No audio snippets found in this list");
        return;
      }

      const orderedSnippets = sniplistItemsData
        .map(item => {
          const snippet = snippetsData.find(s => s.id === item.snippet_id);
          if (snippet) {
            return {
              ...snippet,
              sniplist_id: sniplistId
            };
          }
          return null;
        })
        .filter(Boolean) as Snippet[];

      console.log("Ordered snippets:", orderedSnippets.length);

      try {
        const enhancedSnippets = await Promise.all(
          orderedSnippets.map(async (snippet) => {
            if (!snippet) return null;
            
            const isDefaultTitle = snippet.title && snippet.title.includes(`Snippet ${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`);
            
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
              return {
                ...snippet,
                sniplist_id: sniplistId
              };
            }
          })
        );

        const finalSnippets = enhancedSnippets.filter(Boolean) as Snippet[];

        if (isMounted.current) {
          setSnippets(finalSnippets);
          console.log("Final enhanced snippets:", finalSnippets.length);
        }
      } catch (error) {
        console.error("Error enhancing snippets with YouTube data:", error);
        // Continue with basic snippet data if enhancement fails
        if (isMounted.current) {
          setSnippets(orderedSnippets);
        }
      }
    } catch (error: any) {
      console.error('❌ Error in fetchSniplistItems:', error);
      toast.error(`Failed to load sniplist: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (shouldAdvance.current) {
      shouldAdvance.current = false;
      advanceToNextSnippet();
    }
  }, [currentSnippetIndex, snippets.length]);

  useEffect(() => {
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }

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
