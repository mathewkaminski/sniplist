
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerButtonProps {
  isPlaying: boolean;
  playerReady: boolean;
  onToggle: () => void;
  size?: "default" | "large";
}

export function PlayerButton({ 
  isPlaying, 
  playerReady, 
  onToggle,
  size = "default" 
}: PlayerButtonProps) {
  const isMobile = useIsMobile();

  return (
    <Button 
      size="icon" 
      variant="ghost"
      onClick={onToggle}
      disabled={!playerReady}
      title={playerReady ? (isPlaying ? "Pause" : "Play") : "Loading player..."}
      className={`${size === "large" ? "w-16 h-16" : "w-12 h-12"} touch-manipulation active:scale-95 transition-transform`}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <Pause className={size === "large" ? "h-8 w-8" : "h-6 w-6"} />
      ) : (
        <Play className={size === "large" ? "h-8 w-8" : "h-6 w-6"} />
      )}
    </Button>
  );
}
