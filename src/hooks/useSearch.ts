
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
        console.log("Executing search with term:", searchTerm.trim());
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .ilike('title', `%${searchTerm.trim()}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Search error:', error);
          return [];
        }
        
        if (!data || data.length === 0) {
          console.log("No results found for search term:", searchTerm.trim());
          
          // Debug: Check what data exists in the view
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
        
        console.log(`Found ${data.length} results for "${searchTerm}":`);
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
