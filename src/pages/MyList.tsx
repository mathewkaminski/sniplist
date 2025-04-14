
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { Trash2 } from "lucide-react";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { fetchVideoTitle } from "@/utils/youtube";

interface Snippet {
  id: string;
  title: string;
  video_id: string;
  start_time: number;
  end_time: number;
  created_at: string;
  youtube_title?: string;
}

export default function MyList() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch YouTube titles for all snippets in parallel
      const snippetsWithTitles = await Promise.all(
        (data || []).map(async (snippet) => {
          try {
            const youtubeTitle = await fetchVideoTitle(snippet.video_id);
            console.log(`Fetched title for ${snippet.video_id}:`, youtubeTitle);
            return {
              ...snippet,
              youtube_title: youtubeTitle
            };
          } catch (err) {
            console.error(`Failed to fetch title for ${snippet.video_id}:`, err);
            return {
              ...snippet,
              youtube_title: 'Untitled Video'
            };
          }
        })
      );
      
      setSnippets(snippetsWithTitles);
    } catch (error: any) {
      console.error('Error fetching snippets:', error);
      toast.error(`Failed to load snippets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSnippets(snippets.filter(snippet => snippet.id !== id));
      toast.success('Snippet deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Snippets</h1>
            {loading ? (
              <p>Loading snippets...</p>
            ) : snippets.length === 0 ? (
              <p className="text-gray-500">No snippets saved yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snippets.map((snippet) => (
                    <TableRow key={snippet.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={snippet.youtube_title || snippet.title}>
                          {snippet.youtube_title || snippet.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SnippetPlayer 
                          videoId={snippet.video_id}
                          startTime={snippet.start_time}
                          endTime={snippet.end_time}
                        />
                      </TableCell>
                      <TableCell>{`${Math.floor(snippet.start_time)}s - ${Math.floor(snippet.end_time)}s`}</TableCell>
                      <TableCell>
                        {formatDistance(new Date(snippet.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(snippet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
