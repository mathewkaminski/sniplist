import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Scissors } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

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

  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const handleSetSnippet = () => {
    if (!player) return;
    
    const currentPosition = player.getCurrentTime();
    const snippetEnd = Math.min(duration, currentPosition + 20); // 20 seconds from current position
    
    setSnippetMarker({ start: currentPosition, end: snippetEnd });
    toast.success("Snippet marked! Click 'Snip' to save the 20-second segment.");
  };

  const handleSnip = async () => {
    if (!snippetMarker || !videoId) return;
    
    try {
      setIsSaving(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Please sign in to save snippets");
        return;
      }

      const { error: insertError } = await supabase
        .from('snippets')
        .insert({
          video_id: videoId,
          start_time: snippetMarker.start,
          end_time: snippetMarker.end,
          user_id: user.id,
          title: `Snippet ${Math.floor(snippetMarker.start)}s - ${Math.floor(snippetMarker.end)}s`,
        });

      if (insertError) throw insertError;
      
      toast.success("Snippet saved successfully!");
      setSnippetMarker(null);
    } catch (error: any) {
      toast.error("Error saving snippet: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

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
          {!isPlaying && !snippetMarker && (
            <Button
              onClick={handleSetSnippet}
              variant="default"
              className="ml-2"
            >
              Set
            </Button>
          )}
          {snippetMarker && (
            <Button
              onClick={handleSnip}
              variant="default"
              className="ml-2 gap-2"
              disabled={isSaving}
            >
              <Scissors className="h-4 w-4" />
              {isSaving ? "Saving..." : "Snip"}
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
