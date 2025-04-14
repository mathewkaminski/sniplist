
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  videoId: string | null;
}

export function AudioPlayer({ videoId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new YT.Player('youtube-player', {
        videoId,
        events: {
          onReady: () => {
            setDuration(newPlayer.getDuration());
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === YT.PlayerState.PLAYING);
          },
        },
      });
      setPlayer(newPlayer);
    };

    return () => {
      player?.destroy();
    };
  }, [videoId]);

  // Update current time every second while playing
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const togglePlayPause = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSliderChange = (values: number[]) => {
    if (!player || values.length === 0) return;
    
    const newTime = values[0];
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  if (!videoId) return null;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            variant="outline"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSliderChange}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </div>
      </div>
    </Card>
  );
}
