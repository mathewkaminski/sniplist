
import { useEffect, useRef } from "react";
import { useSniplistData } from "./useSniplistData";
import { usePlaylistControl } from "./usePlaylistControl";

export const useSniplistPlayback = (sniplistId: string) => {
  const { snippets, loading, fetchSniplistItems } = useSniplistData(sniplistId);
  const {
    currentSnippetIndex,
    playlistComplete,
    isCurrentSnippetPlaying,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
    setSnippetPlayingStatus
  } = usePlaylistControl(snippets);
  const fetchAttempts = useRef(0);
  const maxFetchAttempts = 3;

  // Try fetching the sniplist data with retries
  useEffect(() => {
    if (!sniplistId) {
      console.error("No sniplist ID provided");
      return;
    }

    const attemptFetch = async () => {
      try {
        console.log(`Fetching sniplist ${sniplistId}, attempt ${fetchAttempts.current + 1}/${maxFetchAttempts}`);
        await fetchSniplistItems();
        fetchAttempts.current = 0; // Reset on success
      } catch (error) {
        fetchAttempts.current++;
        console.error(`Error fetching sniplist (attempt ${fetchAttempts.current}/${maxFetchAttempts}):`, error);
        
        // Retry with exponential backoff
        if (fetchAttempts.current < maxFetchAttempts) {
          const delay = Math.min(1000 * Math.pow(2, fetchAttempts.current - 1), 10000);
          console.log(`Retrying in ${delay}ms...`);
          
          setTimeout(() => {
            attemptFetch();
          }, delay);
        }
      }
    };
    
    attemptFetch();
  }, [sniplistId, fetchSniplistItems]);

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
