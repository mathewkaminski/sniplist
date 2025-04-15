
import { formatDistance } from "date-fns";
import { useState } from "react";
import { SniplistPlayer } from "./SniplistPlayer";

interface SniplistCardProps {
  id: string;
  title: string;
  created_at: string;
}

export function SniplistCard({ id, title, created_at }: SniplistCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div 
        key={id} 
        className="p-4 border rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          Created {formatDistance(new Date(created_at), new Date(), { addSuffix: true })}
        </p>
      </div>
      {isPlaying && (
        <SniplistPlayer 
          sniplistId={id} 
          onClose={() => setIsPlaying(false)} 
        />
      )}
    </>
  );
}
