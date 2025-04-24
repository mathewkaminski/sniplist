
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface PlayerButtonProps {
  isPlaying: boolean;
  playerReady: boolean;
  onToggle: () => void;
}

export function PlayerButton({ isPlaying, playerReady, onToggle }: PlayerButtonProps) {
  return (
    <Button 
      size="icon" 
      variant="ghost"
      onClick={onToggle}
      disabled={!playerReady}
      title={playerReady ? (isPlaying ? "Pause" : "Play") : "Loading player..."}
      className="w-12 h-12 touch-manipulation" // Improved touch target size
    >
      {isPlaying ? (
        <Pause className="h-6 w-6" />
      ) : (
        <Play className="h-6 w-6" />
      )}
    </Button>
  );
}
