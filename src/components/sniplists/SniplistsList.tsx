
import { useState } from "react";
import { SniplistCard } from "./SniplistCard";
import { SniplistPlayer } from "./SniplistPlayer";

interface Sniplist {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

interface SniplistsListProps {
  sniplists: Sniplist[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export function SniplistsList({ sniplists, loading, onDelete }: SniplistsListProps) {
  const [playingSniplistId, setPlayingSniplistId] = useState<string | null>(null);
  
  const handlePlay = (sniplistId: string) => {
    console.log("Opening sniplist player for:", sniplistId);
    setPlayingSniplistId(sniplistId);
  };
  
  const handleClose = () => {
    console.log("Closing sniplist player");
    setPlayingSniplistId(null);
  };

  if (loading) {
    return <p>Loading sniplists...</p>;
  }

  if (sniplists.length === 0) {
    return <p className="text-gray-500">No sniplists created yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sniplists.map((sniplist) => (
        <SniplistCard
          key={sniplist.id}
          id={sniplist.id}
          title={sniplist.title}
          created_at={sniplist.created_at}
          onDelete={onDelete}
          onPlay={handlePlay}
        />
      ))}
      
      {playingSniplistId && (
        <SniplistPlayer 
          sniplistId={playingSniplistId} 
          onClose={handleClose} 
        />
      )}
    </div>
  );
}
