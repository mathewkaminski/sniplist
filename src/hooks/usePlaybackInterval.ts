
import { useCallback } from 'react';

interface UsePlaybackIntervalProps {
  player: YT.Player | null;
  endTime: number;
  isPlaying: boolean;
  intervalRef: React.MutableRefObject<number | null>;
  setIsPlaying: (playing: boolean) => void;
  cleanupInterval: () => void;
  onEnded?: () => void;
}

export function usePlaybackInterval({
  player,
  endTime,
  isPlaying,
  intervalRef,
  setIsPlaying,
  cleanupInterval,
  onEnded
}: UsePlaybackIntervalProps) {
  const startInterval = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      if (!player) return;
      
      try {
        const currentTime = player.getCurrentTime();
        if (currentTime >= endTime) {
          player.pauseVideo();
          setIsPlaying(false);
          cleanupInterval();
          
          if (onEnded) {
            onEnded();
          }
        }
      } catch (e) {
        console.error("Error in playback monitoring:", e);
        cleanupInterval();
      }
    }, 100);
  }, [player, endTime, onEnded, cleanupInterval, setIsPlaying, intervalRef]);

  return {
    startInterval
  };
}
