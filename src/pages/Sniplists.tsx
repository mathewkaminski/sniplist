
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

  useEffect(() => {
    fetchSniplists();
  }, []);

  useEffect(() => {
    const playId = searchParams.get('play');
    if (playId) {
      // Find the sniplist in our list and auto-play it
      const sniplist = sniplists.find(s => s.id === playId);
      if (sniplist) {
        // We'll let the SniplistCard handle the actual playing
        const element = document.getElementById(`sniplist-${playId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.click();
        }
      }
    }
  }, [searchParams, sniplists]);

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
          <h1 className="text-2xl font-bold mb-6">My Sniplists</h1>
          <SniplistsList sniplists={sniplists} loading={loading} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}
