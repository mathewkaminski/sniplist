
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
        
        // Execute query with explicit ilike
        console.log("Executing search query with pattern:", `%${searchTerm}%`);
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .ilike('title', `%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Search error:', error);
          return [];
        }
        
        console.log("Search results count:", data?.length);
        console.log("Search results:", data);
        
        // If no results, try a direct query with more debug information
        if (!data || data.length === 0) {
          console.log("No results found, trying direct query to check if view has data");
          
          // Get all results to see what's available
          const { data: allResults, error: allError } = await supabase
            .from('search_results')
            .select('*')
            .limit(5);
          
          if (allError) {
            console.error("Error fetching sample results:", allError);
          } else {
            console.log("Sample from search_results view:", allResults);
            if (allResults && allResults.length > 0) {
              console.log("Available titles:", allResults.map(r => r.title));
            } else {
              console.log("No data found in search_results view. Ensure the view is populated.");
            }
          }
        }
        
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
