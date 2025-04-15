
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PrivacyToggle } from "./PrivacyToggle";
import { supabase } from "@/integrations/supabase/client";

export function FirstLoginDialog({ 
  open, 
  onClose 
}: { 
  open: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error updating first login status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Sniplist!</DialogTitle>
          <DialogDescription>
            Choose your profile visibility preference. You can change this later in your profile settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <PrivacyToggle initialValue={true} />
          <Button 
            onClick={handleContinue} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
