
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { PlayerButton } from "./PlayerButton";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SnippetPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  size?: "default" | "large";
  forcePlay?: boolean;
}

export function SnippetPlayer({ 
  videoId, 
  startTime, 
  endTime, 
  autoplay = false, 
  onEnded,
  onPlayStateChange,
  size = "default",
  forcePlay = false
}: SnippetPlayerProps) {
  const isMobile = useIsMobile();
  const manualPlayAttempted = useRef(false);
  const [isPendingPlay, setIsPendingPlay] = useState(false);
  
  const {
    playerRef,
    isPlaying,
    playerReady,
    togglePlayPause
  } = useYouTubePlayer({
    videoId,
    startTime,
    endTime,
    autoplay: isMobile ? false : autoplay, // Don't autoplay on mobile by default
    onEnded,
    forcePlay: forcePlay || isPendingPlay
  });

  // Report play state changes to parent component
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Handle pending play request (e.g., from parent component)
  useEffect(() => {
    if (forcePlay && playerReady && !isPlaying) {
      console.log("SnippetPlayer: Force play received, attempting to play");
      togglePlayPause();
      setIsPendingPlay(false);
    }
  }, [forcePlay, playerReady, isPlaying, togglePlayPause]);

  // Enhanced toggle function for mobile
  const handleTogglePlay = () => {
    manualPlayAttempted.current = true;
    
    // If player isn't ready yet, mark we want to play as soon as it's ready
    if (!playerReady) {
      console.log("Player not ready, marking pending play");
      setIsPendingPlay(true);
    } else {
      togglePlayPause();
    }
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
