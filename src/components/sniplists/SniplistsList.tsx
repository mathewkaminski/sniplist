
import { SniplistCard } from "./SniplistCard";

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
        />
      ))}
    </div>
  );
}
