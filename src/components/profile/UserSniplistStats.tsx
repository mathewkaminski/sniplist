
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SniplistStat {
  sniplist_id: string;
  title: string;
  total_plays: number;
  plays_with_two_songs: number;
}

export function UserSniplistStats({ userId }: { userId: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['sniplist-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sniplist_stats')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as SniplistStat[];
    }
  });

  if (isLoading) return <p>Loading stats...</p>;
  if (!stats?.length) return <p>No sniplists created yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sniplist</TableHead>
          <TableHead>Total Plays</TableHead>
          <TableHead>Plays (2+ songs)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat.sniplist_id}>
            <TableCell>{stat.title}</TableCell>
            <TableCell>{stat.total_plays}</TableCell>
            <TableCell>{stat.plays_with_two_songs}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
