
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export function AudioPlayer() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="outline">
            <Play className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Slider
              defaultValue={[0]}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Select a 20-second snippet
        </div>
      </div>
    </Card>
  );
}
