
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
}

export function SnippetPlayer({ videoId, startTime, endTime }: SnippetPlayerProps) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerId = `youtube-player-${videoId}-${startTime}`;
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.destroy();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, startTime]);

  const initializePlayer = () => {
    if (!window.YT || !playerContainerRef.current) return;
    
    try {
      const newPlayer = new window.YT.Player(playerId, {
        videoId,
        events: {
          onReady: () => {
            console.log("Snippet player ready for video:", videoId);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });

      setPlayer(newPlayer);
    } catch (error) {
      console.error("Error initializing snippet player:", error);
    }
  };

  const togglePlayPause = () => {
    if (!player) return;

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
        const currentTime = player.getCurrentTime();
        if (currentTime >= endTime) {
          player.pauseVideo();
          setIsPlaying(false);
          clearInterval(intervalRef.current as number);
          intervalRef.current = null;
        }
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={playerContainerRef}>
        <div id={playerId} style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }} />
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
