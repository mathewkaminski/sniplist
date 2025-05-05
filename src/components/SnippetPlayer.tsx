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
  const autoplayAttempted = useRef(false);
  const forcePlayAttempted = useRef(false);
  const retryAttemptsRef = useRef(0);
  const maxRetryAttempts = 3;
  const playbackCheckInterval = useRef<number | null>(null);
  
  // Load YouTube API
  const { isAPIReady } = useYouTubeAPI();
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (playbackCheckInterval.current) {
        window.clearInterval(playbackCheckInterval.current);
        playbackCheckInterval.current = null;
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

  // Initialize YouTube player
  useEffect(() => {
    if (!isAPIReady || !playerRef.current) return;
    
    const initializePlayer = async () => {
      try {
        if (!playerInstance.current) {
          playerInstance.current = new YT.Player(playerId, {
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
                console.log("YouTube player ready for video:", videoId);
                playerInstance.current = event.target;
                setPlayerReady(true);
                retryAttemptsRef.current = 0;
                autoplayAttempted.current = false;
                forcePlayAttempted.current = false;
                
                // If autoplay or forcePlay is enabled, attempt to play
                if ((autoplay && !isMobile) || forcePlay) {
                  setTimeout(() => {
                    tryToPlay();
                  }, 300);
                }

                // Set up playback monitoring for mobile
                if (isMobile) {
                  setupMobilePlaybackMonitoring();
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

  // Set up mobile playback monitoring
  const setupMobilePlaybackMonitoring = () => {
    if (playbackCheckInterval.current) {
      window.clearInterval(playbackCheckInterval.current);
    }

    playbackCheckInterval.current = window.setInterval(() => {
      if (!playerInstance.current || !playerReady) return;

      try {
        const playerState = playerInstance.current.getPlayerState();
        const currentTime = playerInstance.current.getCurrentTime();

        // Check if playback has stalled
        if (isPlaying && 
            playerState !== YT.PlayerState.PLAYING && 
            playerState !== YT.PlayerState.BUFFERING) {
          console.log("Mobile playback stalled, attempting recovery");
          tryToPlay();
        }

        // Check if we've reached the end time
        if (currentTime >= endTime - 0.2) {
          console.log("Reached end time, stopping playback");
          stopPlayback();
          onEnded?.();
        }
      } catch (e) {
        console.error("Error in mobile playback monitoring:", e);
      }
    }, 500);
  };

  // Handle player state changes
  const handlePlayerStateChange = (state: number) => {
    console.log("Player state changed:", state);
    
    switch (state) {
      case YT.PlayerState.PLAYING:
        setIsPlaying(true);
        setIsBuffering(false);
        setIsActuallyPlaying(true);
        onPlayStateChange?.(true);
        break;
        
      case YT.PlayerState.PAUSED:
        setIsPlaying(false);
        setIsBuffering(false);
        setIsActuallyPlaying(false);
        onPlayStateChange?.(false);
        break;
        
      case YT.PlayerState.BUFFERING:
        setIsBuffering(true);
        break;
        
      case YT.PlayerState.ENDED:
        stopPlayback();
        onEnded?.();
        break;
        
      case YT.PlayerState.UNSTARTED:
        setIsPlaying(false);
        setIsBuffering(false);
        setIsActuallyPlaying(false);
        break;
    }
  };

  // Handle player errors
  const handlePlayerError = () => {
    console.error("Player error occurred");
    setIsPlaying(false);
    setIsBuffering(false);
    setIsActuallyPlaying(false);
    onPlayStateChange?.(false);
    
    if (retryAttemptsRef.current < maxRetryAttempts) {
      retryAttemptsRef.current++;
      console.log(`Retrying playback (attempt ${retryAttemptsRef.current}/${maxRetryAttempts})`);
      setTimeout(() => {
        tryToPlay();
      }, 1000);
    } else {
      toast.error("Failed to play video after multiple attempts");
    }
  };

  // Try to play the video with error handling
  const tryToPlay = () => {
    if (!playerInstance.current || !playerReady) {
      console.log("Cannot play: player not ready");
      return false;
    }
    
    try {
      console.log("Attempting to play video from", startTime);
      playerInstance.current.seekTo(startTime, true);
      
      // Add a small delay after seeking
      setTimeout(() => {
        if (!playerInstance.current) return;
        
        try {
          playerInstance.current.playVideo();
          setIsPlaying(true);
          
          // For mobile: check if playback actually started
          if (isMobile) {
            setTimeout(() => {
              if (!playerInstance.current) return;
              
              const playerState = playerInstance.current.getPlayerState();
              if (playerState !== YT.PlayerState.PLAYING && 
                  playerState !== YT.PlayerState.BUFFERING) {
                console.log("Play attempt failed, retrying...");
                playerInstance.current.playVideo();
              }
            }, 500);
          }
        } catch (playError) {
          console.error("Error during play attempt:", playError);
          return false;
        }
      }, 100);
      
      return true;
    } catch (e) {
      console.error("Error playing video:", e);
      return false;
    }
  };

  // Stop playback
  const stopPlayback = () => {
    if (!playerInstance.current) return;
    
    try {
      playerInstance.current.pauseVideo();
      setIsPlaying(false);
      setIsActuallyPlaying(false);
      onPlayStateChange?.(false);
    } catch (e) {
      console.error("Error stopping playback:", e);
    }
  };

  return (
    <div ref={playerRef} id={playerId} className="hidden" />
  );
}
