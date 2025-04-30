
import { Button } from "@/components/ui/button";
import { Play, Pause, LoaderCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerButtonProps {
  isPlaying: boolean;
  playerReady: boolean;
  onToggle: () => void;
  size?: "default" | "large";
  isBuffering?: boolean;
  isActuallyPlaying?: boolean;
}

export function PlayerButton({ 
  isPlaying, 
  playerReady, 
  onToggle,
  size = "default",
  isBuffering = false,
  isActuallyPlaying = false
}: PlayerButtonProps) {
  const isMobile = useIsMobile();
  
  // Determine button status
  let buttonStatus: "playing" | "paused" | "loading" | "ready" = "ready";
  if (!playerReady) {
    buttonStatus = "loading";
  } else if (isBuffering) {
    buttonStatus = "loading";
  } else if (isPlaying) {
    buttonStatus = "playing";
  } else {
    buttonStatus = "paused";
  }
  
  return (
    <Button 
      size="icon" 
      variant="ghost"
      onClick={onToggle}
      disabled={!playerReady && !isPlaying}
      title={
        buttonStatus === "loading" ? "Loading..." : 
        buttonStatus === "playing" ? "Pause" : "Play"
      }
      className={`
        ${size === "large" ? "w-16 h-16" : "w-12 h-12"} 
        touch-manipulation 
        active:scale-95 
        transition-transform
        ${isMobile ? "p-2" : ""}
        ${isBuffering ? "opacity-80" : ""}
        ${!playerReady && isPlaying ? "animate-pulse" : ""}
      `}
      aria-label={isPlaying ? "Pause" : "Play"}
      style={{
        touchAction: "manipulation"
      }}
    >
      {buttonStatus === "loading" ? (
        <LoaderCircle className={`
          ${size === "large" ? "h-8 w-8" : "h-6 w-6"}
          ${isMobile ? "stroke-2" : ""}
          animate-spin
        `} />
      ) : buttonStatus === "playing" ? (
        <Pause className={`
          ${size === "large" ? "h-8 w-8" : "h-6 w-6"}
          ${isMobile ? "stroke-2" : ""}
        `} />
      ) : (
        <Play className={`
          ${size === "large" ? "h-8 w-8" : "h-6 w-6"}
          ${isMobile ? "stroke-2" : ""}
        `} />
      )}
    </Button>
  );
}
