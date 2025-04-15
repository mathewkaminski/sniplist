
import { useCallback } from 'react';

interface UsePlaybackControlProps {
  player: YT.Player | null;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  intervalRef: React.MutableRefObject<number | null>;
  setIsPlaying: (playing: boolean) => void;
  cleanupInterval: () => void;
  onEnded?: () => void;
}

export function usePlaybackControl({
  player,
  startTime,
  endTime,
  isPlaying,
  intervalRef,
  setIsPlaying,
  cleanupInterval,
  onEnded
}: UsePlaybackControlProps) {
  const togglePlayPause = useCallback(() => {
    if (!player) {
      console.log("Player not ready yet");
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
      cleanupInterval();
    } else {
      player.seekTo(startTime, true);
      player.playVideo();
      setIsPlaying(true);
      
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
    }
  }, [player, isPlaying, startTime, endTime, onEnded, cleanupInterval, setIsPlaying, intervalRef]);

  return {
    togglePlayPause
  };
}
