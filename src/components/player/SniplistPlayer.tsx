import { useEffect, useRef } from 'react';
import { SnippetPlayer } from './SnippetPlayer';
import { useSniplistPlayback } from '@/hooks/player/useSniplistPlayback';
import { PlayerControls } from './PlayerControls';
import { PlaybackProgress } from './PlaybackProgress';
import { ErrorBoundary } from './ErrorBoundary';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface SniplistPlayerProps {
  sniplistId: string;
  onClose: () => void;
}

export function SniplistPlayer({ sniplistId, onClose }: SniplistPlayerProps) {
  const isMobile = useIsMobile();
  const {
    snippets,
    currentSnippetIndex,
    isPlaying,
    loading,
    error,
    playNextSnippet,
    playPreviousSnippet,
    togglePlay,
    restart,
  } = useSniplistPlayback(sniplistId);

  const currentSnippet = snippets[currentSnippetIndex];
  const nextSnippet = snippets[currentSnippetIndex + 1];
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle preloading of next snippet
  useEffect(() => {
    if (!nextSnippet || isMobile) return;

    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(() => {
      // Preload next snippet when 75% through current snippet
      const currentDuration = currentSnippet.end_time - currentSnippet.start_time;
      const preloadDelay = currentDuration * 0.75 * 1000;

      setTimeout(() => {
        if (nextSnippet) {
          console.log('Preloading next snippet:', nextSnippet.video_id);
          // The actual preloading is handled by the SnippetPlayer component
        }
      }, preloadDelay);
    }, 1000);

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [currentSnippetIndex, snippets, isMobile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="text-red-500">{error.message}</div>
        <button onClick={restart}>Retry</button>
      </div>
    );
  }

  if (!snippets.length) {
    return <div>No snippets found</div>;
  }

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with the player</div>}
      onError={(error) => {
        console.error('Player error:', error);
        toast.error('Playback error occurred');
      }}
    >
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            <SnippetPlayer
              key={`${currentSnippet.video_id}-${currentSnippet.start_time}`}
              videoId={currentSnippet.video_id}
              startTime={currentSnippet.start_time}
              endTime={currentSnippet.end_time}
              autoplay={!isMobile}
              onEnded={playNextSnippet}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) {
                  togglePlay();
                }
              }}
              forcePlay={isPlaying}
            />

            <PlaybackProgress
              current={currentSnippetIndex + 1}
              total={snippets.length}
              snippet={currentSnippet}
            />

            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onNext={playNextSnippet}
              onPrevious={playPreviousSnippet}
              onClose={onClose}
              hasNext={currentSnippetIndex < snippets.length - 1}
              hasPrevious={currentSnippetIndex > 0}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 