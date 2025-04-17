
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface FavoriteButtonProps {
  type: "snippet" | "sniplist";
  id: string;
  className?: string;
}

export function FavoriteButton({ type, id, className = "" }: FavoriteButtonProps) {
  const { user } = useCurrentUser();
  const { 
    favoriteSnippets, 
    favoriteSniplists, 
    toggleFavoriteSnippet, 
    toggleFavoriteSniplist 
  } = useFavorites();

  const isFavorited = type === "snippet" 
    ? favoriteSnippets.includes(id)
    : favoriteSniplists.includes(id);

  const handleToggle = async () => {
    if (type === "snippet") {
      await toggleFavoriteSnippet(id);
    } else {
      await toggleFavoriteSniplist(id);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={className}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-500"}`} 
      />
    </Button>
  );
}
