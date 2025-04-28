
import { useCallback } from 'react';
import { usePlaybackInterval } from './usePlaybackInterval';
import { useIsMobile } from './use-mobile';

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
  const isMobile = useIsMobile();
  
  const { startInterval } = usePlaybackInterval({
    player,
    endTime,
    isPlaying,
    intervalRef,
    setIsPlaying,
    cleanupInterval,
    onEnded
  });

  const togglePlayPause = useCallback(() => {
    if (!player) {
      console.log("Player not ready yet");
      return;
    }

    if (isPlaying) {
      console.log("Pausing video");
      player.pauseVideo();
      setIsPlaying(false);
      cleanupInterval();
    } else {
      console.log("Playing video from", startTime);
      player.seekTo(startTime, true);
      
      // On mobile, we need to use a slight delay for more reliable playback
      if (isMobile) {
        setTimeout(() => {
          if (player) {
            player.playVideo();
            setTimeout(() => {
              if (player && player.getPlayerState() !== 1) { // 1 = playing
                console.log("Mobile play retry");
                player.playVideo();
              }
            }, 500);
          }
        }, 100);
      } else {
        player.playVideo();
      }
      
      setIsPlaying(true);
      startInterval();
    }
  }, [player, isPlaying, startTime, cleanupInterval, setIsPlaying, startInterval, isMobile]);

  return {
    togglePlayPause
  };
}
