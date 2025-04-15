
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Sniplist {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export function useSniplistsData(userId?: string) {
  const [sniplists, setSniplists] = useState<Sniplist[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [noSniplists, setNoSniplists] = useState(false);

  useEffect(() => {
    console.log("🧪 Hook received userId:", userId);

    // Don't treat the literal string ":userId" as a valid ID
    if (userId && userId !== ":userId") {
      console.log("🧪 Triggering checkUserAccess with userId:", userId);
      checkUserAccess(userId);
    } else {
      console.log("🧪 Triggering fetchSniplists (no userId)");
      fetchSniplists();
    }
  }, [userId]);

  const checkUserAccess = async (userId: string) => {
    console.log("🧪 Inside checkUserAccess for:", userId);
    try {
      const { data: authData } = await supabase.auth.getUser();
      console.log('Auth data:', authData);
      
      const isCurrentUser = authData.user?.id === userId;
      setIsCurrentUser(isCurrentUser);
      console.log('Is current user:', isCurrentUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, is_public')
        .eq('id', userId)
        .single();
      
      console.log('Profile data:', profileData, 'Error:', profileError);
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (profileData) {
        setUsername(profileData.username || 'User');
        
        if (!isCurrentUser && profileData.is_public === false) {
          console.log('Profile is private, blocking access');
          setIsPrivate(true);
          setLoading(false);
          return;
        }
        
        console.log('Access granted, fetching sniplists');
        fetchUserSniplists(userId);
      } else {
        console.log('No profile found for user:', userId);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user access:', error);
      setLoading(false);
    }
  };

  const fetchSniplists = async () => {
    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData.user) {
        setIsCurrentUser(true);
        fetchUserSniplists(authData.user.id);
      } else {
        const { data, error } = await supabase
          .from('sniplists')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSniplists(data || []);
        setLoading(false);
        
        if (data && data.length === 0) {
          setNoSniplists(true);
        }
      }
    } catch (error: any) {
      console.error('Error fetching sniplists:', error);
      toast.error(`Failed to load sniplists: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchUserSniplists = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching sniplists for user:', userId);

      const { data, error } = await supabase
        .from('sniplists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      console.log(`Sniplists query for user ${userId}:`, data, error);
      
      if (error) throw error;
      setSniplists(data || []);
      
      if (!data || data.length === 0) {
        setNoSniplists(true);
      } else {
        setNoSniplists(false);
      }
    } catch (error: any) {
      console.error('Error fetching user sniplists:', error);
      toast.error(`Failed to load user sniplists: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    sniplists,
    loading,
    username,
    isPrivate,
    isCurrentUser,
    noSniplists,
    handleDelete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('sniplists')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSniplists(sniplists.filter(sniplist => sniplist.id !== id));
        toast.success('Sniplist deleted successfully');
      } catch (error: any) {
        console.error('Error deleting sniplist:', error);
        toast.error(`Failed to delete sniplist: ${error.message}`);
      }
    }
  };
}
