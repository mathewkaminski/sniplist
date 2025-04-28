
import { useRef, useEffect, useCallback, useState } from "react";
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
  forcePlay?: boolean;
}

export function useYouTubePlayer({
  videoId,
  startTime,
  endTime,
  autoplay = false,
  onEnded,
  forcePlay = false
}: UseYouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInitialized = useRef(false);
  const playerId = `youtube-player-${videoId}-${startTime}-${Math.random().toString(36).substring(2, 9)}`;
  const autoplayAttempted = useRef(false);
  const forcePlayAttempted = useRef(false);
  const isMobile = useIsMobile();
  const mobilePlayCheckTimerId = useRef<number | null>(null);
  
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

  // Mobile-specific playback monitoring
  useEffect(() => {
    if (isMobile && player && playerReady && isPlaying) {
      // Check more frequently on mobile to ensure playback is progressing
      mobilePlayCheckTimerId.current = window.setInterval(() => {
        try {
          const playerState = player.getPlayerState();
          if (playerState !== YT.PlayerState.PLAYING && playerState !== YT.PlayerState.BUFFERING) {
            console.log("Mobile playback stalled, state:", playerState);
            player.playVideo();
          }
        } catch (e) {
          console.error("Error during mobile playback check:", e);
        }
      }, 1000);
    }
    
    return () => {
      if (mobilePlayCheckTimerId.current) {
        clearInterval(mobilePlayCheckTimerId.current);
        mobilePlayCheckTimerId.current = null;
      }
    };
  }, [isMobile, player, playerReady, isPlaying]);

  // Force play when explicitly requested (e.g., from parent component)
  useEffect(() => {
    if (playerReady && player && forcePlay && !forcePlayAttempted.current && !isPlaying) {
      forcePlayAttempted.current = true;
      console.log(`Force play requested for ${videoId} at ${startTime}`);
      
      try {
        player.seekTo(startTime, true);
        setTimeout(() => {
          if (player) {
            player.playVideo();
            setIsPlaying(true);
            
            // Double check that playback actually started
            setTimeout(() => {
              try {
                if (player && player.getPlayerState() !== YT.PlayerState.PLAYING) {
                  console.log("Force play didn't work, trying again");
                  player.playVideo();
                }
              } catch (e) {
                console.error("Error during force play check:", e);
              }
            }, 500);
          }
        }, 100);
      } catch (e) {
        console.error("Error during force play:", e);
        forcePlayAttempted.current = false; // Reset so we can try again
      }
    }
    
    // Reset flag when forcePlay becomes false to allow future forced plays
    if (!forcePlay) {
      forcePlayAttempted.current = false;
    }
  }, [playerReady, player, forcePlay, videoId, startTime, isPlaying, setIsPlaying]);

  // Regular autoplay when player is ready
  useEffect(() => {
    if (playerReady && player && autoplay && !autoplayAttempted.current) {
      autoplayAttempted.current = true;
      const delay = isMobile ? 1000 : 300; // Longer delay for mobile
      
      setTimeout(() => {
        console.log(`Attempting autoplay for ${videoId} at ${startTime}, isMobile: ${isMobile}`);
        try {
          player.seekTo(startTime, true);
          player.playVideo();
          setIsPlaying(true);
          
          // On mobile, we need an extra check to ensure playback actually started
          if (isMobile) {
            setTimeout(() => {
              try {
                const playerState = player.getPlayerState();
                if (playerState !== YT.PlayerState.PLAYING && playerState !== YT.PlayerState.BUFFERING) {
                  console.log("Mobile autoplay failed, trying again");
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
  }, [playerReady, player, autoplay, videoId, startTime, isMobile, setIsPlaying]);

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
          if (player) {
            player.playVideo();
            setIsPlaying(true);
            
            // Double-check playback actually started
            setTimeout(() => {
              try {
                if (player && player.getPlayerState() !== YT.PlayerState.PLAYING) {
                  console.log("Mobile play retry needed");
                  player.playVideo();
                }
              } catch (e) {
                console.error("Error during mobile play check:", e);
              }
            }, 500);
          }
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
            autoplay: 0, // Never autoplay initially, we'll control this manually
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
  }, [isAPIReady, videoId, startTime, handlePlayerReady, handleStateChange, playerId]);

  return {
    playerRef,
    playerId,
    isPlaying,
    playerReady,
    togglePlayPause: enhancedTogglePlayPause
  };
}
