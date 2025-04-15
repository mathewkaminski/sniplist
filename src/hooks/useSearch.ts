
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  type: 'profile' | 'sniplist';
  title: string;
  id: string;
  created_at: string;
}

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const MIN_SEARCH_LENGTH = 3;

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < MIN_SEARCH_LENGTH) return [];
      
      try {
        console.log("Searching for:", searchTerm);
        
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .ilike('title', `%${searchTerm}%`)
          .limit(20);

        if (error) {
          console.error('Search error:', error);
          return [];
        }
        
        console.log("Search results:", data);
        return data as SearchResult[];
      } catch (err) {
        console.error('Unexpected search error:', err);
        return [];
      }
    },
    enabled: searchTerm.trim().length >= MIN_SEARCH_LENGTH
  });

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    hasMinimumChars: searchTerm.trim().length >= MIN_SEARCH_LENGTH
  };
}
