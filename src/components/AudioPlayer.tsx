
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  videoId: string | null;
}

interface SnippetMarker {
  start: number;
  end: number;
}

export function AudioPlayer({ videoId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [snippetMarker, setSnippetMarker] = useState<SnippetMarker | null>(null);

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
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

  const handleSetSnippet = () => {
    if (!player) return;
    
    const currentPosition = player.getCurrentTime();
    const snippetStart = Math.max(0, currentPosition - 10); // Start 10 seconds before current position
    const snippetEnd = Math.min(duration, currentPosition + 10); // End 10 seconds after current position
    
    setSnippetMarker({ start: snippetStart, end: snippetEnd });
    toast.success("Snippet marker set! 20-second segment marked for processing.");
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
          {!isPlaying && (
            <Button
              onClick={handleSetSnippet}
              variant="default"
              className="ml-2"
            >
              Set
            </Button>
          )}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
          {snippetMarker && (
            <span>
              Snippet: {Math.floor(snippetMarker.start)}s - {Math.floor(snippetMarker.end)}s
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
