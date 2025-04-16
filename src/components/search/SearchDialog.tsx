
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { SearchIcon } from "lucide-react";
import { useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) setSearchTerm("");
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="z-50 max-w-md p-0 bg-white shadow-xl border rounded-md overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command>
          <div className="flex items-center border-b px-3 py-2">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search sniplists and users..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading results...</div>
            ) : hasMinimumChars && results.length > 0 ? (
              <CommandGroup heading="Results">
                {results.map((result, idx) => (
                  <CommandItem
                    key={`${result.type}-${result.id}-${idx}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    <span>{result.title}</span>
                    <Badge variant="outline" className="ml-auto">{result.type}</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
