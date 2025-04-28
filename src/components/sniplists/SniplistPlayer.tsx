
import { SniplistPlayerProps } from "./types";
import { useSniplistPlayback } from "@/hooks/useSniplistPlayback";
import { PlayerLoadingState } from "./PlayerLoadingState";
import { PlayerEmptyState } from "./PlayerEmptyState";
import { PlaylistComplete } from "./PlaylistComplete";
import { NowPlaying } from "./NowPlaying";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";

export function SniplistPlayer({ sniplistId, onClose }: SniplistPlayerProps) {
  const {
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
  } = useSniplistPlayback(sniplistId);

  const isMobile = useIsMobile();
  const initializedRef = useRef(false);

  // Handle first-time opening of player on mobile
  useEffect(() => {
    if (!loading && snippets.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      
      // Don't auto-start on mobile - user needs to click play first
      if (!isMobile) {
        setSnippetPlayingStatus(true);
      }
    }
  }, [loading, snippets, isMobile, setSnippetPlayingStatus]);

  if (loading) {
    return <PlayerLoadingState onClose={onClose} />;
  }

  if (snippets.length === 0) {
    return <PlayerEmptyState onClose={onClose} />;
  }

  if (playlistComplete) {
    return (
      <PlaylistComplete 
        onRestart={handleRestartPlaylist}
        onClose={onClose}
      />
    );
  }

  return (
    <NowPlaying
      currentSnippet={snippets[currentSnippetIndex]}
      snippets={snippets}
      currentSnippetIndex={currentSnippetIndex}
      onClose={onClose}
      onSnippetEnd={handleSnippetEnd}
      onSnippetSelect={setCurrentSnippetIndex}
      setPlaylistComplete={setPlaylistComplete}
      isCurrentSnippetPlaying={isCurrentSnippetPlaying}
      setSnippetPlayingStatus={setSnippetPlayingStatus}
    />
  );
}
