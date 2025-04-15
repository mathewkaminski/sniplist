
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Award, Users } from 'lucide-react';

interface TopUser {
  user_id: string;
  username: string;
  total_plays: number;
  plays_with_two_plus_songs: number;
}

export function UserLeaderboard() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_top_users', { limit_count: 10 });
      
      if (error) throw error;
      
      setTopUsers(data || []);
    } catch (error) {
      console.error('Error fetching top users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading leaderboard...</div>;
  if (topUsers.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <div className="flex items-center mb-4">
        <Users className="mr-2 h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-bold">Top Sniplist Creators</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Total Plays</TableHead>
            <TableHead>Plays with 2+ Songs</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topUsers.map((user, index) => (
            <TableRow key={user.user_id}>
              <TableCell>
                {index === 0 && <Award className="text-yellow-500 inline-block mr-2" />}
                {index + 1}
              </TableCell>
              <TableCell>{user.username || 'Anonymous'}</TableCell>
              <TableCell>{user.total_plays}</TableCell>
              <TableCell>{user.plays_with_two_plus_songs}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/sniplists?userId=${user.user_id}`)}
                >
                  View Sniplists
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
