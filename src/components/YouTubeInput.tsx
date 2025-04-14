
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isValidYouTubeUrl, extractYouTubeId } from "@/utils/youtube";

export function YouTubeInput() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    const videoId = extractYouTubeId(url);
    
    try {
      // For now we'll just validate and extract the ID
      // In the next step we'll add actual video loading
      toast.success(`Valid YouTube video ID: ${videoId}`);
    } catch (error) {
      toast.error("Failed to load video");
      console.error("Error loading video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Add YouTube Video</h2>
          <p className="text-sm text-gray-500">
            Paste a YouTube URL to start creating your audio snippet
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Video"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
