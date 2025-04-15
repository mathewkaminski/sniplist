
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  type: "profile" | "sniplist";
  title: string;
  id: string;
  created_at: string;
}

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const MIN_SEARCH_LENGTH = 3;

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      const trimmedTerm = searchTerm.trim();
      if (trimmedTerm.length < MIN_SEARCH_LENGTH) return [];

      console.log("🔍 Calling Edge Function with term:", trimmedTerm);

      const { data, error } = await supabase.functions.invoke("search_sniplists", {
        body: { searchTerm: `%${trimmedTerm}%` },
      });

      if (error) {
        console.error("❌ Edge Function error:", error);
        return [];
      }

      if (data && Array.isArray(data.data)) {
        return data.data as SearchResult[];
      }

      console.warn("⚠️ Unexpected search format:", data);
      return [];
    },
    enabled: false, // Prevent auto-run, we'll manually trigger with refetch
  });

  // Manually trigger the search when the term changes
  useEffect(() => {
    if (searchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      refetch();
    }
  }, [searchTerm, refetch]);

  return {
    searchTerm,
    setSearchTerm,
    results: Array.isArray(data) ? data : [],
    isLoading,
    hasMinimumChars: searchTerm.trim().length >= MIN_SEARCH_LENGTH,
  };
}
