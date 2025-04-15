import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading, hasMinimumChars } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("SearchDialog state:", {
      searchTerm,
      resultsCount: results?.length || 0,
      isLoading,
      hasMinimumChars,
      results,
    });
  }, [searchTerm, results, isLoading, hasMinimumChars]);

  const handleSelect = (result: { type: string; id: string }) => {
    onOpenChange(false);
    setSearchTerm("");

    if (result.type.toLowerCase() === "profile") {
      navigate(`/profile/${result.id}`);
      toast.success("Viewing profile");
    } else {
      navigate(`/sniplists?play=${result.id}`);
      toast.success("Playing sniplist");
    }
  };

  // ✅ Only show content if open
  if (!open) return null;

  return (
    <div className="p-6 border rounded bg-white shadow-md">
      <h2 className="font-semibold mb-4">Testing the inside</h2>
      <Command>
        <CommandList className="max-h-[300px] overflow-y-auto border bg-gray-100">
          <CommandGroup heading="Test Group">
            <CommandItem
              onSelect={() => console.log("Clicked")}
              className="flex items-center gap-2"
            >
              <span>Alvvvays</span>
              <Badge variant="outline" className="ml-auto">
                sniplist
              </Badge>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
