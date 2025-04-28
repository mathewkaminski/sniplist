
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
  const checkFrequency = isMobile ? 250 : 500; // Check much more frequently on mobile
  
  const startInterval = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      if (!player) return;
      
      try {
        const currentTime = player.getCurrentTime();
        const playerState = player.getPlayerState();
        
        // More aggressive end detection - check if we're close to or past the end time
        // This helps on mobile where timing can be less precise
        if (currentTime >= endTime - 0.25) { // 0.25 second buffer for mobile
          console.log(`Video reached end time ${currentTime} >= ${endTime - 0.25}`);
          player.pauseVideo();
          setIsPlaying(false);
          cleanupInterval();
          
          if (onEnded) {
            console.log("Calling onEnded callback");
            onEnded();
          }
        }
        // On mobile, also check if the player stopped unexpectedly
        else if (isMobile && isPlaying) {
          if (playerState !== YT.PlayerState.PLAYING && playerState !== YT.PlayerState.BUFFERING) {
            console.log(`Mobile player state changed unexpectedly to ${playerState}, trying to resume`);
            player.playVideo();
          }
          
          // For mobile: if the player is ENDED but we haven't reached our endTime yet, 
          // it means the YouTube video ended naturally but we need to ensure our onEnded callback fires
          if (playerState === YT.PlayerState.ENDED) {
            console.log(`YouTube video ended naturally before our end time`);
            setIsPlaying(false);
            cleanupInterval();
            
            if (onEnded) {
              console.log("Calling onEnded callback for natural end");
              onEnded();
            }
          }
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
