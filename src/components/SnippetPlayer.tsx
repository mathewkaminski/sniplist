
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import { PlayerButton } from "./PlayerButton";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedPlayback } from "@/hooks/useUnifiedPlayback";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  size?: "default" | "large";
  forcePlay?: boolean;
}

export function SnippetPlayer({ 
  videoId, 
  startTime, 
  endTime, 
  autoplay = false, 
  onEnded,
  onPlayStateChange,
  size = "default",
  forcePlay = false
}: SnippetPlayerProps) {
  const isMobile = useIsMobile();
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<YT.Player | null>(null);
  const playerId = `youtube-player-${videoId}-${startTime}-${Math.random().toString(36).substring(2, 9)}`;
  const playerInitialized = useRef(false);
  const [isPendingPlay, setIsPendingPlay] = useState(false);
  
  // Load YouTube API
  const { isAPIReady } = useYouTubeAPI();
  
  // Initialize unified playback system
  const {
    isPlaying,
    isActuallyPlaying,
    isBuffering,
    playerReady,
    togglePlayPause,
    setPlayerReadyState,
    cleanup
  } = useUnifiedPlayback({
    player: playerInstance.current,
    videoId,
    startTime,
    endTime,
    onEnded,
    autoplay: isMobile ? false : autoplay, // Don't autoplay on mobile by default
    forcePlay: forcePlay || isPendingPlay
  });

  // Report play state changes to parent component
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Handle player initialization
  useEffect(() => {
    if (isAPIReady && !playerInitialized.current && playerRef.current) {
      try {
        playerInitialized.current = true;
        console.log("Setting up player for video:", videoId);

        const div = document.createElement('div');
        div.id = playerId;
        playerRef.current.appendChild(div);

        const newPlayer = new window.YT.Player(playerId, {
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
            onReady: () => {
              console.log("YouTube player ready");
              playerInstance.current = newPlayer;
              setPlayerReadyState(true);
            },
            onStateChange: (event) => {
              console.log("YouTube state changed:", event.data);
            }
          }
        });
      } catch (error) {
        console.error("Error initializing player for video:", videoId, error);
      }
    }
    
    // Clean up on unmount
    return () => {
      cleanup();
      playerInitialized.current = false;
      if (playerInstance.current) {
        try {
          playerInstance.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        playerInstance.current = null;
      }
    };
  }, [isAPIReady, videoId, startTime, playerId, setPlayerReadyState, cleanup]);

  // Enhanced toggle function for mobile
  const handleTogglePlay = () => {
    console.log("Toggle button clicked");
    
    // If player isn't ready yet, mark we want to play as soon as it's ready
    if (!playerReady) {
      console.log("Player not ready, marking pending play");
      setIsPendingPlay(true);
    } else {
      togglePlayPause();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={playerRef} className="w-1 h-1 opacity-0">
        {/* YouTube player will be mounted here */}
      </div>
      <PlayerButton 
        isPlaying={isPlaying}
        playerReady={playerReady}
        onToggle={handleTogglePlay}
        size={size}
        isBuffering={isBuffering}
        isActuallyPlaying={isActuallyPlaying}
      />
    </div>
  );
}
