
import { SniplistPlayerProps } from "./types";
import { useSniplistPlayback } from "./useSniplistPlayback";
import { PlayerLoadingState } from "./PlayerLoadingState";
import { PlayerEmptyState } from "./PlayerEmptyState";
import { PlaylistComplete } from "./PlaylistComplete";
import { NowPlaying } from "./NowPlaying";

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
