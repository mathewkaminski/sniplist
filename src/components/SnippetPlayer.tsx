
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { PlayerButton } from "./PlayerButton";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  size?: "default" | "large";
}

export function SnippetPlayer({ 
  videoId, 
  startTime, 
  endTime, 
  autoplay = false, 
  onEnded,
  onPlayStateChange,
  size = "default"
}: SnippetPlayerProps) {
  const isMobile = useIsMobile();
  const manualPlayAttempted = useRef(false);
  
  const {
    playerRef,
    isPlaying,
    playerReady,
    togglePlayPause
  } = useYouTubePlayer({
    videoId,
    startTime,
    endTime,
    autoplay: isMobile ? false : autoplay, // Don't rely on autoplay on mobile
    onEnded
  });

  // Report play state changes to parent component
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Enhanced toggle function for mobile
  const handleTogglePlay = () => {
    manualPlayAttempted.current = true;
    togglePlayPause();
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={playerRef} className="w-1 h-1 opacity-0">
        {/* YouTube player will be mounted here */}
      </div>
      <PlayerButton 
        isPlaying={isPlaying}
        playerReady={playerReady}
        onToggle={handleTogglePlay}
        size={size}
      />
    </div>
  );
}
