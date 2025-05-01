import { useEffect, useRef } from 'react';
import { usePlaybackEngine } from '@/hooks/player/usePlaybackEngine';
import { useNetworkStatus } from '@/hooks/player/useNetworkStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  forcePlay?: boolean;
}

export function SnippetPlayer({
  videoId,
  startTime,
  endTime,
  autoplay = false,
  onEnded,
  onPlayStateChange,
  forcePlay = false,
}: SnippetPlayerProps) {
  const isMobile = useIsMobile();
  const playbackEngine = usePlaybackEngine({
    mobileOptimized: isMobile,
    bufferStrategy: isMobile ? 'conservative' : 'aggressive',
    onError: (error) => {
      toast.error(`Playback error: ${error.message}`);
      onEnded?.();
    },
    onStateChange: (state) => {
      onPlayStateChange?.(state.isPlaying);
    },
  });

  const { state, player } = playbackEngine;
  const endTimeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const networkStatus = useNetworkStatus();

  // Handle network status changes
  useEffect(() => {
    if (networkStatus === 'offline') {
      toast.error('Network connection lost. Playback will resume when connected.');
    }
  }, [networkStatus]);

  // Initialize playback
  useEffect(() => {
    if (!player || !videoId) return;

    const initializePlayback = async () => {
      try {
        await player.loadVideoById({
          videoId,
          startSeconds: startTime,
        });

        if (autoplay || forcePlay) {
          const playPromise = player.playVideo();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }

        // Set up end time checker
        startEndTimeChecker();
      } catch (error) {
        console.error('Error initializing playback:', error);
        onEnded?.();
      }
    };

    initializePlayback();

    return () => {
      if (endTimeCheckRef.current) {
        clearInterval(endTimeCheckRef.current);
      }
    };
  }, [videoId, startTime, player]);

  // Monitor playback position and handle end time
  const startEndTimeChecker = () => {
    if (endTimeCheckRef.current) {
      clearInterval(endTimeCheckRef.current);
    }

    endTimeCheckRef.current = setInterval(() => {
      if (!player) return;

      try {
        const currentTime = player.getCurrentTime();
        if (currentTime >= endTime) {
          player.pauseVideo();
          onEnded?.();
        }
      } catch (error) {
        console.error('Error checking end time:', error);
      }
    }, 100);
  };

  return (
    <div className="relative">
      <div id="main-player" className="aspect-video" />
      <div id="preload-player" className="hidden" />
      {state.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="loading-spinner" />
        </div>
      )}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <p>Error playing video</p>
            <button
              className="mt-2 px-4 py-2 bg-white text-black rounded"
              onClick={() => playbackEngine.retryPlayback()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 