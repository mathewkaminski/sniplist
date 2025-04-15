
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
}

export function SnippetPlayer({ videoId, startTime, endTime, autoplay = false }: SnippetPlayerProps) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInitialized = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const playerId = `youtube-player-${videoId}-${startTime}-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    // Only load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else if (!playerInitialized.current) {
      // If YouTube API is loaded but player is not initialized
      initializePlayer();
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
    if (!window.YT || !playerRef.current) {
      console.log("YouTube API not ready or container not found");
      return;
    }
    
    if (playerInitialized.current) {
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
        div.style.width = '1px';
        div.style.height = '1px';
        div.style.position = 'absolute';
        div.style.opacity = '0';
        playerRef.current.appendChild(div);
      }
      
      const newPlayer = new window.YT.Player(playerId, {
        videoId: videoId,
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
            }
          }
        }
      });
    } catch (error) {
      console.error("Error initializing snippet player:", error);
    }
  };

  const togglePlayPause = () => {
    if (!player) {
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
