
import { useRef, useEffect, useCallback } from "react";
import { useYouTubeAPI } from "./useYouTubeAPI";
import { usePlayerState } from "./usePlayerState";
import { usePlaybackControl } from "./usePlaybackControl";
import { useIsMobile } from "./use-mobile";

interface UseYouTubePlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
}

export function useYouTubePlayer({
  videoId,
  startTime,
  endTime,
  autoplay = false,
  onEnded
}: UseYouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInitialized = useRef(false);
  const playerId = `youtube-player-${videoId}-${startTime}-${Math.random().toString(36).substring(2, 9)}`;
  const autoplayAttempted = useRef(false);
  const isMobile = useIsMobile();
  
  const { isAPIReady } = useYouTubeAPI();
  
  const {
    player,
    isPlaying,
    playerReady,
    intervalRef,
    handlePlayerReady,
    handleStateChange,
    setIsPlaying,
    cleanupInterval
  } = usePlayerState({ onEnded });

  const { togglePlayPause } = usePlaybackControl({
    player,
    startTime,
    endTime,
    isPlaying,
    intervalRef,
    setIsPlaying,
    cleanupInterval,
    onEnded
  });

  // Force play when player is ready if autoplay is enabled
  useEffect(() => {
    if (playerReady && player && autoplay && !autoplayAttempted.current) {
      autoplayAttempted.current = true;
      const delay = isMobile ? 1000 : 500; // Longer delay for mobile
      
      setTimeout(() => {
        console.log(`Attempting autoplay for ${videoId} at ${startTime}, isMobile: ${isMobile}`);
        try {
          player.seekTo(startTime, true);
          player.playVideo();
          
          // On mobile, we need an extra check to ensure playback actually started
          if (isMobile) {
            setTimeout(() => {
              try {
                // Check if video is actually playing
                const playerState = player.getPlayerState();
                if (playerState !== window.YT.PlayerState.PLAYING) {
                  console.log("Mobile autoplay failed, attempting again");
                  player.playVideo();
                }
              } catch (e) {
                console.error("Error during mobile play check:", e);
              }
            }, 1000);
          }
        } catch (e) {
          console.error("Error during autoplay attempt:", e);
        }
      }, delay);
    }
  }, [playerReady, player, autoplay, videoId, startTime, isMobile]);

  // Enhanced togglePlayPause for mobile
  const enhancedTogglePlayPause = useCallback(() => {
    console.log("Toggle play/pause called, isMobile:", isMobile);
    
    if (!player || !playerReady) {
      console.log("Player not ready yet");
      return;
    }

    // For mobile, ensure we always seek to start time when playing
    if (!isPlaying && isMobile) {
      try {
        player.seekTo(startTime, true);
        setTimeout(() => {
          player.playVideo();
          setIsPlaying(true);
        }, 100);
      } catch (e) {
        console.error("Error during mobile play:", e);
      }
    } else {
      togglePlayPause();
    }
  }, [player, playerReady, isPlaying, isMobile, startTime, togglePlayPause, setIsPlaying]);

  // Initialize player when API is ready
  useEffect(() => {
    if (isAPIReady && !playerInitialized.current && playerRef.current) {
      try {
        playerInitialized.current = true;
        console.log("Setting up player for video:", videoId);

        const div = document.createElement('div');
        div.id = playerId;
        playerRef.current.appendChild(div);

        new window.YT.Player(playerId, {
          videoId: videoId,
          height: '1',
          width: '1',
          playerVars: {
            autoplay: autoplay && !isMobile ? 1 : 0, // Don't autoplay on mobile
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1, // Important for mobile playback
            start: Math.floor(startTime)
          },
          events: {
            onReady: handlePlayerReady,
            onStateChange: handleStateChange
          }
        });
      } catch (error) {
        console.error("Error initializing player for video:", videoId, error);
      }
    }
  }, [isAPIReady, videoId, startTime, autoplay, handlePlayerReady, handleStateChange, playerId, isMobile]);

  return {
    playerRef,
    playerId,
    isPlaying,
    playerReady,
    togglePlayPause: enhancedTogglePlayPause
  };
}
