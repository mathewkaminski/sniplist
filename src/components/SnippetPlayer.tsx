
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { PlayerButton } from "./PlayerButton";
import { useEffect } from "react";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function SnippetPlayer({ 
  videoId, 
  startTime, 
  endTime, 
  autoplay = false, 
  onEnded,
  onPlayStateChange
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

  // Report play state changes to parent component
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

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
