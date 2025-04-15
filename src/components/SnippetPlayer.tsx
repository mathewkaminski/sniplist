
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
}

export function SnippetPlayer({ videoId, startTime, endTime, autoplay = false, onEnded }: SnippetPlayerProps) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInitialized = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const playerId = `youtube-player-${videoId}-${startTime}-${Math.random().toString(36).substring(2, 9)}`;

  // Load YouTube API if not already loaded
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onload = () => {
        // Once the API is loaded, we can initialize the player
        if (window.YT && window.YT.Player) {
          initializePlayer();
        } else {
          window.onYouTubeIframeAPIReady = initializePlayer;
        }
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else if (window.YT && window.YT.Player) {
      // API is already loaded, initialize player
      initializePlayer();
    } else {
      // API is loading but not ready, wait for it
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }
    };
  }, [videoId, startTime]);

  const initializePlayer = () => {
    if (playerInitialized.current || !window.YT || !window.YT.Player) {
      return;
    }
    
    if (!playerRef.current) {
      console.log("Player container not found");
      return;
    }
    
    playerInitialized.current = true;
    console.log("Initializing player for:", videoId);
    
    try {
      // Make sure the player container element exists and is empty
      const container = document.getElementById(playerId);
      if (!container) {
        const div = document.createElement('div');
        div.id = playerId;
        playerRef.current.appendChild(div);
      }
      
      const newPlayer = new window.YT.Player(playerId, {
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
          start: Math.floor(startTime)
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            console.log("Snippet player ready for video:", videoId);
            setPlayer(event.target);
            setPlayerReady(true);
            if (autoplay) {
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
              if (event.data === YT.PlayerState.ENDED && onEnded) {
                onEnded();
              }
            }
          },
          onError: (event: YT.OnErrorEvent) => {
            console.error("YouTube player error:", event);
          }
        }
      });
    } catch (error) {
      console.error("Error initializing snippet player:", error);
    }
  };

  const togglePlayPause = () => {
    if (!player || !playerReady) {
      console.log("Player not ready yet");
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      player.seekTo(startTime, true);
      player.playVideo();
      setIsPlaying(true);
      
      // Monitor playback to stop at end time
      intervalRef.current = window.setInterval(() => {
        if (!player) return;
        
        try {
          const currentTime = player.getCurrentTime();
          if (currentTime >= endTime) {
            player.pauseVideo();
            setIsPlaying(false);
            clearInterval(intervalRef.current as number);
            intervalRef.current = null;
            
            if (onEnded) {
              onEnded();
            }
          }
        } catch (e) {
          console.error("Error in playback monitoring:", e);
          clearInterval(intervalRef.current as number);
          intervalRef.current = null;
        }
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={playerRef} className="hidden">
        {/* YouTube player will be mounted here in an invisible container */}
      </div>
      <Button 
        size="icon" 
        variant="ghost"
        onClick={togglePlayPause}
        disabled={!playerReady}
        title={playerReady ? (isPlaying ? "Pause" : "Play") : "Loading player..."}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
