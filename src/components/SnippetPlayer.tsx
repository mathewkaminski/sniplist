
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

  useEffect(() => {
    if (!window.YT || !playerContainerRef.current) return;

    const newPlayer = new window.YT.Player(playerId, {
      videoId,
      height: '1',
      width: '1',
      events: {
        onReady: () => {
          console.log("Snippet player ready");
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

    return () => {
      newPlayer.destroy();
    };
  }, [videoId, startTime]);

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.seekTo(startTime, true);
      player.playVideo();
      
      // Stop playback when reaching end time
      const checkTime = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime >= endTime) {
          player.pauseVideo();
          setIsPlaying(false);
          clearInterval(checkTime);
        }
      }, 100);

      // Clear interval when stopping
      setTimeout(() => {
        clearInterval(checkTime);
      }, (endTime - startTime) * 1000 + 1000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={playerContainerRef}>
        <div id={playerId} style={{ width: 1, height: 1 }} />
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
