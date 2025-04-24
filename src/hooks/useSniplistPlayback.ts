
import { useEffect } from "react";
import { useSniplistData } from "./sniplists/useSniplistData";
import { usePlaylistControl } from "./sniplists/usePlaylistControl";

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
