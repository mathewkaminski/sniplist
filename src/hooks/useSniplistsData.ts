
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

    if (userId && userId !== ":userId") {
      console.log("🧪 Triggering checkUserAccess with userId:", userId);
      checkUserAccess(userId);
    } else {
      console.log("🧪 Triggering fetchSniplists (no userId)");
      fetchSniplists();
    }
  }, [userId]);

  const checkUserAccess = async (userId: string) => {
    console.log("🔍 Checking access for user:", userId);
    try {
      // Check if current user is viewing their own profile
      const { data: authData } = await supabase.auth.getUser();
      const isCurrentUser = authData.user?.id === userId;
      setIsCurrentUser(isCurrentUser);
      console.log('Auth check - Is current user:', isCurrentUser);

      // Get profile data for requested user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, is_public')
        .eq('id', userId)
        .single();
      
      console.log('Profile data:', profileData, 'Error:', profileError);
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found (404)
          toast.error('User profile not found');
          setLoading(false);
          return;
        }
        
        console.error('Profile fetch error:', profileError);
        toast.error(`Error accessing profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (profileData) {
        setUsername(profileData.username || 'User');
        
        // Allow access if current user OR profile is public
        if (isCurrentUser || profileData.is_public) {
          console.log('Access granted, fetching sniplists');
          fetchUserSniplists(userId);
        } else {
          console.log('Profile is private, blocking access');
          setIsPrivate(true);
          setLoading(false);
        }
      } else {
        console.log('No profile found for user:', userId);
        toast.error('User profile not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user access:', error);
      toast.error('Failed to check user access');
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
        // For non-authenticated users, fetch public sniplists
        const { data, error } = await supabase
          .from('sniplists')
          .select(`
            *,
            profiles:user_id(is_public)
          `)
          .eq('profiles.is_public', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter out any sniplists where profile is not public (extra safety)
        const publicSniplists = data?.filter(list => list.profiles?.is_public) || [];
        
        setSniplists(publicSniplists);
        setNoSniplists(publicSniplists.length === 0);
        setLoading(false);
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

      // Direct query with detailed error handling
      const { data, error } = await supabase
        .from('sniplists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error in Supabase query:', error);
        toast.error(`Failed to load sniplists: ${error.message}`);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${data?.length || 0} sniplists for user ${userId}`);
      setSniplists(data || []);
      setNoSniplists(!data || data.length === 0);
    } catch (error: any) {
      console.error('Error fetching user sniplists:', error);
      toast.error(`Failed to load sniplists: ${error.message}`);
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
