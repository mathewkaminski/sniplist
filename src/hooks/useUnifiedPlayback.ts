
import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileYouTubeAdapter } from "@/adapters/MobileYouTubeAdapter";
import { toast } from "sonner";

interface UseUnifiedPlaybackProps {
  player: YT.Player | null;
  videoId: string;
  startTime: number;
  endTime: number;
  onEnded?: () => void;
  autoplay?: boolean;
  forcePlay?: boolean;
}

export function useUnifiedPlayback({
  player,
  videoId,
  startTime,
  endTime,
  onEnded,
  autoplay = false,
  forcePlay = false
}: UseUnifiedPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const isMobile = useIsMobile();
  const mobileAdapterRef = useRef<MobileYouTubeAdapter | null>(null);
  const playAttemptedRef = useRef(false);
  const forcePlayAttemptedRef = useRef(false);
  const playerStateTimerId = useRef<number | null>(null);
  const isEndHandledRef = useRef(false);

  // Report ended event
  const handleEnded = useCallback(() => {
    if (isEndHandledRef.current) return;
    
    console.log("Playback ended, reporting onEnded");
    isEndHandledRef.current = true;
    setIsPlaying(false);
    setIsActuallyPlaying(false);
    
    if (onEnded) {
      onEnded();
    }
  }, [onEnded]);

  // Clean up resources
  const cleanup = useCallback(() => {
    if (playerStateTimerId.current) {
      window.clearInterval(playerStateTimerId.current);
      playerStateTimerId.current = null;
    }
    
    if (mobileAdapterRef.current) {
      mobileAdapterRef.current.destroy();
      mobileAdapterRef.current = null;
    }
  }, []);

  // Initialize or update mobile adapter when player or time boundaries change
  useEffect(() => {
    if (player && playerReady && isMobile) {
      if (mobileAdapterRef.current) {
        mobileAdapterRef.current.updateTimeBounds(startTime, endTime);
      } else {
        console.log("Creating new mobile adapter");
        mobileAdapterRef.current = new MobileYouTubeAdapter(player, startTime, endTime);
      }
    }
    
    return () => {
      // Clean up when component unmounts or when player changes
      cleanup();
    };
  }, [player, playerReady, startTime, endTime, isMobile, cleanup]);

  // Monitor actual player state (not just the isPlaying React state)
  useEffect(() => {
    if (!player || !playerReady) return;
    
    // Reset handled status when playback parameters change
    isEndHandledRef.current = false;

    // Start monitoring player state
    if (playerStateTimerId.current) {
      window.clearInterval(playerStateTimerId.current);
    }
    
    playerStateTimerId.current = window.setInterval(() => {
      try {
        if (!player) return;
        
        const playerState = player.getPlayerState();
        const currentTime = player.getCurrentTime();
        
        // Update buffer state
        setIsBuffering(playerState === YT.PlayerState.BUFFERING);
        
        // Update actual playing state
        setIsActuallyPlaying(playerState === YT.PlayerState.PLAYING);
        
        // Check for end
        if (currentTime >= endTime - 0.15 && isPlaying) {
          console.log(`Detected end time reached: ${currentTime.toFixed(2)} >= ${endTime.toFixed(2)}`);
          handleEnded();
        }
        
        // Also handle YouTube's natural END state
        if (playerState === YT.PlayerState.ENDED && isPlaying) {
          console.log("YouTube reported ENDED state");
          handleEnded();
        }
      } catch (e) {
        console.error("Error monitoring player state:", e);
      }
    }, isMobile ? 200 : 500);
    
    return () => {
      if (playerStateTimerId.current) {
        window.clearInterval(playerStateTimerId.current);
        playerStateTimerId.current = null;
      }
    };
  }, [player, playerReady, isPlaying, endTime, handleEnded, isMobile]);

  // Special handling for forcePlay
  useEffect(() => {
    if (!forcePlay || !playerReady || !player || forcePlayAttemptedRef.current) return;
    
    forcePlayAttemptedRef.current = true;
    console.log("Force play triggered");
    
    const playVideo = async () => {
      try {
        if (isMobile && mobileAdapterRef.current) {
          const success = await mobileAdapterRef.current.play();
          setIsPlaying(success);
        } else {
          player.seekTo(startTime, true);
          setTimeout(() => {
            player.playVideo();
            setIsPlaying(true);
          }, 100);
        }
      } catch (e) {
        console.error("Force play failed:", e);
        toast.error("Couldn't start playback");
      }
    };
    
    playVideo();
    
    return () => {
      // Reset when forcePlay becomes false
      if (!forcePlay) {
        forcePlayAttemptedRef.current = false;
      }
    };
  }, [forcePlay, playerReady, player, startTime, isMobile]);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || !playerReady || !player || playAttemptedRef.current) return;
    
    // Don't autoplay on mobile unless explicitly forced
    if (isMobile && !forcePlay) {
      console.log("Skipping autoplay on mobile");
      return;
    }
    
    playAttemptedRef.current = true;
    console.log("Autoplay triggered");
    
    const playVideo = async () => {
      try {
        if (isMobile && mobileAdapterRef.current) {
          const success = await mobileAdapterRef.current.play();
          setIsPlaying(success);
        } else {
          player.seekTo(startTime, true);
          setTimeout(() => {
            player.playVideo();
            setIsPlaying(true);
          }, 100);
        }
      } catch (e) {
        console.error("Autoplay failed:", e);
      }
    };
    
    // Add delay for autoplay
    setTimeout(playVideo, 500);
  }, [autoplay, playerReady, player, startTime, isMobile, forcePlay]);

  // Toggle play/pause with unified approach
  const togglePlayPause = useCallback(async () => {
    console.log("Toggle play/pause called, isPlaying:", isPlaying);
    
    if (!player || !playerReady) {
      console.log("Player not ready yet");
      return;
    }
    
    try {
      if (isPlaying) {
        console.log("Pausing playback");
        
        if (isMobile && mobileAdapterRef.current) {
          mobileAdapterRef.current.pause();
        } else {
          player.pauseVideo();
        }
        
        setIsPlaying(false);
      } else {
        console.log("Starting playback");
        isEndHandledRef.current = false;
        
        if (isMobile && mobileAdapterRef.current) {
          const success = await mobileAdapterRef.current.play();
          setIsPlaying(success);
        } else {
          player.seekTo(startTime, true);
          player.playVideo();
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.error("Error toggling playback:", e);
      toast.error("Playback control failed");
    }
  }, [isPlaying, player, playerReady, startTime, isMobile]);

  // Update player ready state
  const setPlayerReadyState = useCallback((ready: boolean) => {
    setPlayerReady(ready);
  }, []);

  return {
    isPlaying,
    isActuallyPlaying,
    isBuffering,
    playerReady,
    togglePlayPause,
    setPlayerReadyState,
    cleanup
  };
}
