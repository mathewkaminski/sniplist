
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isValidYouTubeUrl, extractYouTubeId } from "@/utils/youtube";

export function YouTubeInput() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    const newVideoId = extractYouTubeId(url);
    
    try {
      if (newVideoId) {
        setVideoId(newVideoId);
        toast.success("Video loaded successfully");
      } else {
        toast.error("Failed to extract video ID");
      }
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
      
      {videoId && (
        <div className="mt-6">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
