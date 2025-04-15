
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { UserSniplistStats } from "@/components/profile/UserSniplistStats";
import { PrivacyToggle } from "@/components/profile/PrivacyToggle";
import { FirstLoginDialog } from "@/components/profile/FirstLoginDialog";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_public, first_login')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUsername(data.username || "");
        setIsPublic(data.is_public);
        setIsFirstLogin(data.first_login);
      }
    } catch (error) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error updating profile");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Profile</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username || ""}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy Settings</label>
                <PrivacyToggle initialValue={isPublic} />
              </div>
              <Button onClick={updateProfile}>
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">My Sniplist Stats</h2>
            </CardHeader>
            <CardContent>
              {user && <UserSniplistStats userId={user.id} />}
            </CardContent>
          </Card>
        </div>
      </div>

      <FirstLoginDialog 
        open={isFirstLogin} 
        onClose={() => setIsFirstLogin(false)} 
      />
    </>
  );
}
