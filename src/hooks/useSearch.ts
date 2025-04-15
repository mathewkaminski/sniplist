
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: 'profile' | 'sniplist';
  title: string;
  id: string;
  created_at: string;
}

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('search_results')
        .select('*')
        .ilike('title', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as SearchResult[];
    },
    enabled: searchTerm.trim().length > 0
  });

  return {
    searchTerm,
    setSearchTerm,
    results: results || [],
    isLoading
  };
}
