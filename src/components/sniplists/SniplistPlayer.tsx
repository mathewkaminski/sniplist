
import { SniplistPlayerProps } from "./types";
import { useSniplistPlayback } from "@/hooks/sniplists/useSniplistPlayback";
import { PlayerLoadingState } from "./PlayerLoadingState";
import { PlayerEmptyState } from "./PlayerEmptyState";
import { PlaylistComplete } from "./PlaylistComplete";
import { NowPlaying } from "./NowPlaying";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add loading timeout to show error if loading takes too long
  useEffect(() => {
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (loading) {
          console.error("Loading snippets timed out");
          toast.error("Loading snippets is taking longer than expected. Try again later.");
        }
      }, 10000); // 10 second timeout
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [loading]);

  // Handle first-time opening of player - auto-play the first snippet
  useEffect(() => {
    if (!loading && snippets.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      console.log("Sniplist player initialized, auto-starting playback");
      
      // Short delay to ensure everything is loaded
      setTimeout(() => {
        setSnippetPlayingStatus(true);
      }, isMobile ? 1500 : 800);
    }
  }, [loading, snippets, isMobile, setSnippetPlayingStatus]);

  // Log player state for debugging
  useEffect(() => {
    console.log(`SniplistPlayer state: loading=${loading}, snippets=${snippets.length}, playlistComplete=${playlistComplete}`);
  }, [loading, snippets, playlistComplete]);

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
