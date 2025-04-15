
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
        // Log search execution
        console.log("Executing search with Edge Function, term:", searchTerm.trim());
        
        // Call the Supabase Edge Function
        const { data: responseData, error } = await supabase.functions.invoke('search_sniplists', {
          body: { searchTerm: searchTerm.trim() }
        });

        if (error) {
          console.error('Search function error:', error);
          return [];
        }
        
        // Extract the data array from the response
        const results = responseData?.data || [];
        
        if (!results || results.length === 0) {
          console.log(`No results found for "${searchTerm.trim()}"`);
          return [];
        }
        
        console.log(`Found ${results.length} results for "${searchTerm.trim()}":`);
        console.log("Search results:", results);
        
        return results as SearchResult[];
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
