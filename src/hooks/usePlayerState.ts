
import { useState, useRef } from 'react';

interface UsePlayerStateProps {
  onEnded?: () => void;
}

export function usePlayerState({ onEnded }: UsePlayerStateProps = {}) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const handlePlayerReady = (event: YT.PlayerEvent) => {
    setPlayer(event.target);
    setPlayerReady(true);
  };

  const handleStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (event.data === YT.PlayerState.ENDED && onEnded) {
        onEnded();
      }
    }
  };

  const cleanupInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    player,
    isPlaying,
    playerReady,
    intervalRef,
    handlePlayerReady,
    handleStateChange,
    setIsPlaying,
    cleanupInterval
  };
}
