
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PrivacyToggle({ initialValue = true }: { initialValue?: boolean }) {
  const [isPublic, setIsPublic] = useState(initialValue);

  const handleToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase.auth.getUser();
      if (error) throw error;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_public: checked })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      setIsPublic(checked);
      toast.success(checked ? "Profile is now public" : "Profile is now private");
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast.error("Failed to update privacy setting");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="privacy-mode"
        checked={isPublic}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="privacy-mode">
        {isPublic ? "Public Profile" : "Private Profile"}
      </Label>
    </div>
  );
}
