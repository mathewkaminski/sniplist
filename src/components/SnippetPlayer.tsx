
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import { PlayerButton } from "./PlayerButton";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedPlayback } from "@/hooks/useUnifiedPlayback";
import { toast } from "sonner";

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
  const initAttempts = useRef(0);
  const errorRetryTimerRef = useRef<number | null>(null);
  
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

  // Handle player initialization with retry logic
  useEffect(() => {
    const initializePlayer = () => {
      if (!isAPIReady || !playerRef.current || playerInitialized.current) {
        return;
      }
      
      try {
        console.log("Setting up player for video:", videoId);
        playerInitialized.current = true;
        initAttempts.current += 1;

        // Clean up any existing player in the container
        while (playerRef.current.firstChild) {
          playerRef.current.removeChild(playerRef.current.firstChild);
        }

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
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
              
              // Retry on error if we haven't exceeded max attempts
              if (initAttempts.current < 3) {
                console.log(`Retrying player initialization (attempt ${initAttempts.current + 1}/3)...`);
                playerInitialized.current = false;
                
                if (errorRetryTimerRef.current) {
                  window.clearTimeout(errorRetryTimerRef.current);
                }
                
                errorRetryTimerRef.current = window.setTimeout(() => {
                  initializePlayer();
                }, 1500);
              } else {
                toast.error("Could not load YouTube player. Please try again later.");
              }
            }
          }
        });
      } catch (error) {
        console.error("Error initializing player for video:", videoId, error);
        playerInitialized.current = false;
        
        // Retry initialization if there was an error
        if (initAttempts.current < 3) {
          console.log(`Retrying player initialization after error (attempt ${initAttempts.current + 1}/3)...`);
          
          if (errorRetryTimerRef.current) {
            window.clearTimeout(errorRetryTimerRef.current);
          }
          
          errorRetryTimerRef.current = window.setTimeout(() => {
            initializePlayer();
          }, 1500);
        }
      }
    };
    
    initializePlayer();
    
    // Clean up on unmount
    return () => {
      cleanup();
      playerInitialized.current = false;
      
      if (errorRetryTimerRef.current) {
        window.clearTimeout(errorRetryTimerRef.current);
        errorRetryTimerRef.current = null;
      }
      
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
      
      // Also attempt to retry initialization if needed
      if (!playerInitialized.current && initAttempts.current < 3) {
        playerInitialized.current = false;
        initAttempts.current += 1;
        console.log(`Forcing player reinitialization (attempt ${initAttempts.current}/3)...`);
        
        if (playerRef.current) {
          while (playerRef.current.firstChild) {
            playerRef.current.removeChild(playerRef.current.firstChild);
          }
          
          const div = document.createElement('div');
          div.id = playerId;
          playerRef.current.appendChild(div);
          
          try {
            new window.YT.Player(playerId, {
              videoId: videoId,
              height: '1',
              width: '1',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                start: Math.floor(startTime)
              },
              events: {
                onReady: (event) => {
                  console.log("YouTube player ready from retry");
                  playerInstance.current = event.target;
                  setPlayerReadyState(true);
                  
                  // If we had a pending play request, execute it now
                  if (isPendingPlay) {
                    setTimeout(() => togglePlayPause(), 300);
                  }
                }
              }
            });
          } catch (e) {
            console.error("Error in player reinitialization:", e);
          }
        }
      }
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
