
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
        // Log auth status to check if we're authenticated
        const { data: authData } = await supabase.auth.getUser();
        console.log("Current auth status:", authData?.user ? "Authenticated" : "Not authenticated");
        
        const searchTermTrimmed = searchTerm.trim();
        console.log("Executing search with term:", searchTermTrimmed);
        
        // First try a simple query to see if it returns anything
        console.log("Running search with pattern:", `%${searchTermTrimmed}%`);
        
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .ilike('title', `%${searchTermTrimmed}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Search error:', error);
          return [];
        }
        
        if (!data || data.length === 0) {
          console.log(`No results found for "${searchTermTrimmed}" using ilike.`);
          
          // Try a less restrictive query with LIKE to see if that works
          console.log("Trying fallback with simple like:", `%${searchTermTrimmed.charAt(0)}%`);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('search_results')
            .select('*')
            .like('title', `%${searchTermTrimmed.charAt(0)}%`)
            .limit(5);
            
          if (fallbackError) {
            console.error('Fallback search error:', fallbackError);
          } else if (fallbackData && fallbackData.length > 0) {
            console.log("Fallback search returned data:", fallbackData);
            console.log("Available titles in fallback search:", 
              fallbackData.map(r => ({ title: r.title, type: r.type }))
            );
          }
          
          // Get a sample of data to see what's in the view
          const { data: sampleData } = await supabase
            .from('search_results')
            .select('*')
            .limit(5);
            
          console.log("Sample data from search_results:", sampleData);
          if (sampleData && sampleData.length > 0) {
            console.log("Available titles in search_results:", 
              sampleData.map(r => ({ title: r.title, type: r.type }))
            );
          } else {
            console.log("No data found in search_results view");
          }
          
          return [];
        }
        
        console.log(`Found ${data.length} results for "${searchTermTrimmed}":`);
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
