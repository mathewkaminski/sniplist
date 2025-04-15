
import { useCallback } from 'react';
import { usePlaybackInterval } from './usePlaybackInterval';

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
      player.pauseVideo();
      setIsPlaying(false);
      cleanupInterval();
    } else {
      player.seekTo(startTime, true);
      player.playVideo();
      setIsPlaying(true);
      startInterval();
    }
  }, [player, isPlaying, startTime, cleanupInterval, setIsPlaying, startInterval]);

  return {
    togglePlayPause
  };
}
