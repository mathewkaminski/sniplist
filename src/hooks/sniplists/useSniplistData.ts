
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchVideoData } from "@/utils/youtube";
import { Snippet } from "@/components/sniplists/types";

export function useSniplistData(sniplistId: string) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  // Automatically fetch snippets when the component mounts or sniplistId changes
  useEffect(() => {
    if (sniplistId) {
      console.log("🎵 Sniplist ID changed, fetching snippets for:", sniplistId);
      fetchSniplistItems();
    }
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
      setSnippets(finalSnippets);
    } catch (error: any) {
      console.error('Error in fetchSniplistItems:', error);
      toast.error(`Failed to load sniplist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    snippets,
    loading,
    fetchSniplistItems
  };
}
