
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { PlayerButton } from "./PlayerButton";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
}

export function SnippetPlayer({ 
  videoId, 
  startTime, 
  endTime, 
  autoplay = false, 
  onEnded 
}: SnippetPlayerProps) {
  const {
    playerRef,
    isPlaying,
    playerReady,
    togglePlayPause
  } = useYouTubePlayer({
    videoId,
    startTime,
    endTime,
    autoplay,
    onEnded
  });

  return (
    <div className="flex items-center gap-2">
      <div ref={playerRef} className="w-1 h-1 opacity-0">
        {/* YouTube player will be mounted here */}
      </div>
      <PlayerButton 
        isPlaying={isPlaying}
        playerReady={playerReady}
        onToggle={togglePlayPause}
      />
    </div>
  );
}
