
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  type: "profile" | "sniplist";
  title: string;
  id: string;
  created_at: string;
}

const sanitizeSearchResults = (results: unknown[]): SearchResult[] => {
  try {
    // Use JSON parse/stringify to remove circular references and clone data
    const sanitizedData = JSON.parse(JSON.stringify(results));
    
    // Validate and transform the data
    return sanitizedData.filter((item: unknown): item is SearchResult => {
      // Type guard to ensure each item has the required properties
      const validItem = item as Partial<SearchResult>;
      return (
        typeof validItem?.type === 'string' &&
        (validItem.type === 'profile' || validItem.type === 'sniplist') &&
        typeof validItem?.title === 'string' &&
        typeof validItem?.id === 'string' &&
        typeof validItem?.created_at === 'string'
      );
    });
  } catch (error) {
    console.error("Error sanitizing search results:", error);
    return [];
  }
};

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const MIN_SEARCH_LENGTH = 3;

  const trimmedTerm = searchTerm.trim();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["search", trimmedTerm],
    queryFn: async () => {
      if (trimmedTerm.length < MIN_SEARCH_LENGTH) return [];

      console.log("🔍 Calling Edge Function with term:", trimmedTerm);

      const { data: responseData, error } = await supabase.functions.invoke("search_sniplists", {
        body: { searchTerm: `%${trimmedTerm}%` },
      });

      if (error) {
        console.error("❌ Edge Function error:", error);
        return [];
      }

      if (responseData?.data && Array.isArray(responseData.data)) {
        console.log("✅ Raw search results:", responseData.data);
        const sanitizedResults = sanitizeSearchResults(responseData.data);
        console.log("✅ Sanitized search results:", sanitizedResults);
        return sanitizedResults;
      }

      console.warn("⚠️ Unexpected search format:", responseData);
      return [];
    },
    enabled: false, // Manual refetch
  });

  useEffect(() => {
    if (trimmedTerm.length >= MIN_SEARCH_LENGTH) {
      refetch();
    }
  }, [trimmedTerm, refetch]);

  return {
    searchTerm,
    setSearchTerm,
    results: Array.isArray(data) ? data : [],
    isLoading,
    hasMinimumChars: trimmedTerm.length >= MIN_SEARCH_LENGTH,
  };
}
