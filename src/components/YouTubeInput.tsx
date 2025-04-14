
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function YouTubeInput() {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate and process YouTube URL
    console.log("Processing URL:", url);
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
          <Button type="submit">Load Video</Button>
        </div>
      </form>
    </Card>
  );
}
