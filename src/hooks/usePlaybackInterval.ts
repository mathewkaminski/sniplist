
import { useCallback } from 'react';
import { useIsMobile } from './use-mobile';

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
  const isMobile = useIsMobile();
  const checkFrequency = isMobile ? 50 : 100; // Check more frequently on mobile
  
  const startInterval = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      if (!player) return;
      
      try {
        const currentTime = player.getCurrentTime();
        const playerState = player.getPlayerState();
        
        // Check if we've reached the end time or if the player stopped unexpectedly
        if (currentTime >= endTime) {
          console.log(`Video reached end time ${currentTime} >= ${endTime}`);
          player.pauseVideo();
          setIsPlaying(false);
          cleanupInterval();
          
          if (onEnded) {
            console.log("Calling onEnded callback");
            onEnded();
          }
        }
        // On mobile, also check if the player stopped unexpectedly
        else if (isMobile && isPlaying && playerState !== 1) { // 1 = playing
          console.log(`Mobile player state changed unexpectedly to ${playerState}, trying to resume`);
          player.playVideo();
        }
      } catch (e) {
        console.error("Error in playback monitoring:", e);
        cleanupInterval();
      }
    }, checkFrequency);
  }, [player, endTime, onEnded, cleanupInterval, setIsPlaying, intervalRef, isPlaying, isMobile, checkFrequency]);

  return {
    startInterval
  };
}
