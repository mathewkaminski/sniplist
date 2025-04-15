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
        const trimmedTerm = searchTerm.trim();
        console.log("Executing search with Edge Function, term:", trimmedTerm);

        const { data, error } = await supabase.functions.invoke('search_sniplists', {
          body: { searchTerm: `%${trimmedTerm}%` } // Add wildcard symbols here
        });

        if (error) {
          console.error('Search function error:', error);
          return [];
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log(`No results found for "${trimmedTerm}"`);
          return [];
        }

        console.log(`Found ${data.length} results for "${trimmedTerm}":`, data);
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
    results: Array.isArray(results) ? results : [],
    isLoading,
    hasMinimumChars: searchTerm.trim().length >= MIN_SEARCH_LENGTH
  };
}
