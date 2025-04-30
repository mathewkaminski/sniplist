
import { useEffect } from "react";
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

  useEffect(() => {
    if (sniplistId) {
      fetchSniplistItems();
    }
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
