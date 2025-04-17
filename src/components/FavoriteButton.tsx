
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FavoriteButtonProps {
  type: "snippet" | "sniplist";
  id: string;
  className?: string;
}

export function FavoriteButton({ type, id, className = "" }: FavoriteButtonProps) {
  const { user } = useCurrentUser();
  const [isCreator, setIsCreator] = useState(false);
  const { 
    favoriteSnippets, 
    favoriteSniplists, 
    toggleFavoriteSnippet, 
    toggleFavoriteSniplist 
  } = useFavorites();

  const isFavorited = type === "snippet" 
    ? favoriteSnippets.includes(id)
    : favoriteSniplists.includes(id);

  useEffect(() => {
    if (!user) return;

    const checkCreator = async () => {
      const { data, error } = await supabase
        .from(type === "snippet" ? "snippets" : "sniplists")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!error && data) {
        setIsCreator(data.user_id === user.id);
      }
    };

    checkCreator();
  }, [id, type, user]);

  const handleToggle = async () => {
    if (type === "snippet") {
      await toggleFavoriteSnippet(id);
    } else {
      await toggleFavoriteSniplist(id);
    }
  };

  if (!user || isCreator) return null;

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
