
import { useRef, useEffect } from "react";
import { useYouTubeAPI } from "./useYouTubeAPI";
import { usePlayerState } from "./usePlayerState";
import { usePlaybackControl } from "./usePlaybackControl";

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
      setTimeout(() => {
        console.log(`Attempting autoplay for ${videoId} at ${startTime}`);
        try {
          player.seekTo(startTime, true);
          player.playVideo();
        } catch (e) {
          console.error("Error during autoplay attempt:", e);
        }
      }, 500); // Small delay to ensure player is fully ready
    }
  }, [playerReady, player, autoplay, videoId, startTime]);

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
            autoplay: autoplay ? 1 : 0,
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
  }, [isAPIReady, videoId, startTime, autoplay, handlePlayerReady, handleStateChange, playerId]);

  return {
    playerRef,
    playerId,
    isPlaying,
    playerReady,
    togglePlayPause
  };
}
