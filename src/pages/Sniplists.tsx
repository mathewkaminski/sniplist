
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SniplistsList } from "@/components/sniplists/SniplistsList";
import { useSearchParams } from "react-router-dom";

interface Sniplist {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export default function Sniplists() {
  const [sniplists, setSniplists] = useState<Sniplist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get('userId');
    
    if (userId) {
      fetchUserProfile(userId);
      fetchUserSniplists(userId);
    } else {
      fetchSniplists();
    }
  }, [searchParams]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setUsername(data.username || 'User');
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchSniplists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sniplists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSniplists(data || []);
    } catch (error: any) {
      console.error('Error fetching sniplists:', error);
      toast.error(`Failed to load sniplists: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSniplists = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sniplists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSniplists(data || []);
    } catch (error: any) {
      console.error('Error fetching user sniplists:', error);
      toast.error(`Failed to load user sniplists: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sniplists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSniplists(sniplists.filter(sniplist => sniplist.id !== id));
      toast.success('Sniplist deleted successfully');
    } catch (error: any) {
      console.error('Error deleting sniplist:', error);
      toast.error(`Failed to delete sniplist: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">
            {username ? `${username}'s Sniplists` : 'My Sniplists'}
          </h1>
          <SniplistsList 
            sniplists={sniplists} 
            loading={loading} 
            onDelete={handleDelete} 
          />
        </div>
      </main>
    </div>
  );
}
