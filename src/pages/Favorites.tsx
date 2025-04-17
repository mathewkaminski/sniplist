
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { SniplistsList } from "@/components/sniplists/SniplistsList";
import { SnippetList } from "@/components/snippets/SnippetList";
import { useFavorites } from "@/hooks/useFavorites";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Snippet } from "@/components/snippets/types";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { favoriteSnippets, favoriteSniplists } = useFavorites();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [sniplists, setSniplists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFavorites();
  }, [user, favoriteSnippets, favoriteSniplists]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const [snippetsData, sniplistsData] = await Promise.all([
        supabase
          .from('snippets')
          .select('*')
          .in('id', favoriteSnippets),
        supabase
          .from('sniplists')
          .select('*')
          .in('id', favoriteSniplists)
      ]);

      if (snippetsData.error) throw snippetsData.error;
      if (sniplistsData.error) throw sniplistsData.error;

      setSnippets(snippetsData.data || []);
      setSniplists(sniplistsData.data || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
          
          <Tabs defaultValue="snippets" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="snippets">
                Snippets ({favoriteSnippets.length})
              </TabsTrigger>
              <TabsTrigger value="sniplists">
                Sniplists ({favoriteSniplists.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="snippets">
              {loading ? (
                <p>Loading snippets...</p>
              ) : snippets.length === 0 ? (
                <p className="text-gray-500">No favorite snippets yet.</p>
              ) : (
                <SnippetList 
                  snippets={snippets}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
              )}
            </TabsContent>

            <TabsContent value="sniplists">
              {loading ? (
                <p>Loading sniplists...</p>
              ) : sniplists.length === 0 ? (
                <p className="text-gray-500">No favorite sniplists yet.</p>
              ) : (
                <SniplistsList
                  sniplists={sniplists}
                  loading={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
