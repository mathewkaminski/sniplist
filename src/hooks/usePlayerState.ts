
import { useState, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface UsePlayerStateProps {
  onEnded?: () => void;
}

export function usePlayerState({ onEnded }: UsePlayerStateProps = {}) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const playbackEndedInternally = useRef(false);

  const handlePlayerReady = useCallback((event: YT.PlayerEvent) => {
    setPlayer(event.target);
    setPlayerReady(true);
    console.log("Player ready event fired");
  }, []);

  const handleStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    console.log("Player state changed to:", event.data);
    
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      playbackEndedInternally.current = false;
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      setIsPlaying(false);
      
      // Handle ENDED state with special care for mobile
      if (event.data === YT.PlayerState.ENDED && onEnded && !playbackEndedInternally.current) {
        console.log("Video ended naturally, triggering onEnded");
        playbackEndedInternally.current = true;
        onEnded();
      }

      // For mobile: handle paused state that might come from system events
      if (isMobile && event.data === YT.PlayerState.PAUSED) {
        // We don't automatically handle this case since the user may have 
        // purposefully paused the video
        console.log("Video paused on mobile");
      }
    }
  }, [onEnded, isMobile]);

  const cleanupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
