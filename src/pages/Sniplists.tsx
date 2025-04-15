
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Sniplist {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export default function Sniplists() {
  const [sniplists, setSniplists] = useState<Sniplist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSniplists();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">My Sniplists</h1>
          {loading ? (
            <p>Loading sniplists...</p>
          ) : sniplists.length === 0 ? (
            <p className="text-gray-500">No sniplists created yet.</p>
          ) : (
            <div className="space-y-4">
              {sniplists.map((sniplist) => (
                <div key={sniplist.id} className="p-4 border rounded-lg">
                  <h2 className="text-xl font-semibold">{sniplist.title}</h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
