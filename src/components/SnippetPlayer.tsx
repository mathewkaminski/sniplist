
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import { PlayerButton } from "./PlayerButton";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const playerInitialized = useRef(false);
  const retryAttemptsRef = useRef(0);
  const maxRetryAttempts = 3;
  
  // Load YouTube API
  const { isAPIReady } = useYouTubeAPI();
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
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
  }, []);

  // Initialize the player when API is ready
  useEffect(() => {
    if (!isAPIReady || !playerRef.current || playerInitialized.current) {
      return;
    }
    
    const initializePlayer = () => {
      try {
        playerInitialized.current = true;
        console.log("Setting up player for video:", videoId);
        
        // Clean up any existing player in the container
        while (playerRef.current && playerRef.current.firstChild) {
          playerRef.current.removeChild(playerRef.current.firstChild);
        }
        
        // Create a new container for the player
        const div = document.createElement('div');
        div.id = playerId;
        
        if (playerRef.current) {
          playerRef.current.appendChild(div);
          
          const newPlayer = new window.YT.Player(playerId, {
            videoId: videoId,
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 0, // Never autoplay initially
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1, // Important for mobile
              start: Math.floor(startTime)
            },
            events: {
              onReady: (event) => {
                console.log("YouTube player ready");
                playerInstance.current = event.target;
                setPlayerReady(true);
                retryAttemptsRef.current = 0;
                
                // If autoplay or forcePlay is enabled, attempt to play
                if ((autoplay && !isMobile) || forcePlay) {
                  setTimeout(() => {
                    tryToPlay();
                  }, 300);
                }
              },
              onStateChange: (event) => {
                handlePlayerStateChange(event.data);
              },
              onError: (event) => {
                console.error("YouTube player error:", event.data);
                handlePlayerError();
              }
            }
          });
        }
      } catch (error) {
        console.error("Error initializing player for video:", videoId, error);
        handlePlayerError();
      }
    };
    
    initializePlayer();
  }, [isAPIReady, videoId, startTime, playerId, autoplay, forcePlay, isMobile]);

  // Set up monitoring interval when playing
  useEffect(() => {
    if (!playerReady || !playerInstance.current) return;
    
    if (isPlaying) {
      // Start monitoring playback
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        if (!playerInstance.current) return;
        
        try {
          const currentTime = playerInstance.current.getCurrentTime();
          const playerState = playerInstance.current.getPlayerState();
          
          // Update buffering state
          setIsBuffering(playerState === YT.PlayerState.BUFFERING);
          
          // Update actual playing state
          setIsActuallyPlaying(playerState === YT.PlayerState.PLAYING);
          
          // Check if we've reached the end time
          if (currentTime >= endTime - 0.2) {
            console.log(`Reached end time: ${currentTime.toFixed(2)} >= ${endTime.toFixed(2)}`);
            stopPlayback();
            
            if (onEnded) {
              onEnded();
            }
          }
          
          // For mobile: try to recover stalled playback
          if (isMobile && playerState !== YT.PlayerState.PLAYING && 
              playerState !== YT.PlayerState.BUFFERING && 
              playerState !== YT.PlayerState.PAUSED) {
            console.log("Detected stalled playback on mobile, attempting recovery");
            tryToPlay();
          }
        } catch (e) {
          console.error("Error in playback monitoring:", e);
        }
      }, isMobile ? 300 : 500);
    } else {
      // Stop monitoring when not playing
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playerReady, endTime, onEnded, isMobile]);

  // Notify parent about play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);
  
  // Handle force play prop changes
  useEffect(() => {
    if (forcePlay && playerReady && !isPlaying) {
      tryToPlay();
    }
  }, [forcePlay, playerReady, isPlaying]);

  // Handle player state changes
  const handlePlayerStateChange = (state: YT.PlayerState) => {
    console.log("YouTube state changed:", state);
    
    switch (state) {
      case YT.PlayerState.PLAYING:
        setIsActuallyPlaying(true);
        setIsBuffering(false);
        break;
      case YT.PlayerState.BUFFERING:
        setIsBuffering(true);
        break;
      case YT.PlayerState.PAUSED:
      case YT.PlayerState.ENDED:
        setIsActuallyPlaying(false);
        setIsBuffering(false);
        break;
    }
    
    // Check if this was the end of the video
    if (state === YT.PlayerState.ENDED && isPlaying) {
      console.log("Video ended naturally");
      setIsPlaying(false);
      
      if (onEnded) {
        onEnded();
      }
    }
  };
  
  // Handle player initialization errors
  const handlePlayerError = () => {
    retryAttemptsRef.current++;
    
    if (retryAttemptsRef.current <= maxRetryAttempts) {
      console.log(`Player error, retrying (${retryAttemptsRef.current}/${maxRetryAttempts})...`);
      playerInitialized.current = false;
      
      // Short delay before retry
      setTimeout(() => {
        if (playerRef.current) {
          // Clean up existing player
          while (playerRef.current.firstChild) {
            playerRef.current.removeChild(playerRef.current.firstChild);
          }
          
          // Reinitialize
          playerInitialized.current = false;
        }
      }, 1000);
    } else {
      console.error("Failed to initialize player after multiple attempts");
      toast.error("Could not load video player. Please try again later.");
    }
  };

  // Try to play the video with error handling
  const tryToPlay = () => {
    if (!playerInstance.current || !playerReady) {
      return false;
    }
    
    try {
      console.log("Attempting to play video from", startTime);
      playerInstance.current.seekTo(startTime, true);
      
      // Add a small delay after seeking
      setTimeout(() => {
        if (playerInstance.current) {
          playerInstance.current.playVideo();
          setIsPlaying(true);
          
          // For mobile: check if playback actually started
          if (isMobile) {
            setTimeout(() => {
              if (playerInstance.current) {
                const playerState = playerInstance.current.getPlayerState();
                
                if (playerState !== YT.PlayerState.PLAYING && 
                    playerState !== YT.PlayerState.BUFFERING) {
                  console.log("Play attempt failed, retrying...");
                  playerInstance.current.playVideo();
                }
              }
            }, 500);
          }
        }
      }, 100);
      
      return true;
    } catch (e) {
      console.error("Error playing video:", e);
      toast.error("Playback failed. Please try again.");
      return false;
    }
  };

  // Stop playback
  const stopPlayback = () => {
    if (!playerInstance.current) return;
    
    try {
      playerInstance.current.pauseVideo();
      setIsPlaying(false);
    } catch (e) {
      console.error("Error stopping playback:", e);
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (!playerReady) {
      console.log("Player not ready yet");
      return;
    }
    
    if (isPlaying) {
      stopPlayback();
    } else {
      const success = tryToPlay();
      
      if (!success) {
        toast.error("Playback control failed");
      }
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
