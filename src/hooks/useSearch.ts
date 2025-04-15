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
        console.log("🔍 Executing search with Edge Function, term:", trimmedTerm);

        const { data, error } = await supabase.functions.invoke('search_sniplists', {
          body: { searchTerm: `%${trimmedTerm}%` }
        });

        console.log("🧪 Raw Supabase Edge Function response:", data);

        if (error) {
          console.error('🔴 Supabase Edge Function error:', error);
          return [];
        }

        // Check if the response is directly an array
        if (Array.isArray(data)) {
          console.log("✅ Data is a flat array:", data);
          return data as SearchResult[];
        }

        // Check if the data is wrapped inside a `data` field
        if (data && Array.isArray(data.data)) {
          console.log("✅ Data is wrapped in { data: [...] }:", data.data);
          return data.data as SearchResult[];
        }

        console.warn("⚠️ Unrecognized data format returned:", data);
        return [];
      } catch (err) {
        console.error('🔴 Unexpected search error:', err);
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
