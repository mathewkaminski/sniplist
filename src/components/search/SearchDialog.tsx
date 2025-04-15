import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading, hasMinimumChars } = useSearch();
  const navigate = useNavigate();

  // Debug logging for inspection
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
      <DialogContent className="overflow-hidden p-0 max-w-md">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command>
          <div className="flex items-center border-b px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search sniplists and users..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Render based on state to avoid issues inside CommandList */}
          {isLoading ? (
            <CommandList className="max-h-[300px] overflow-y-auto">
              <div className="p-4 text-sm text-muted-foreground">Loading results...</div>
            </CommandList>
          ) : hasMinimumChars && results.length > 0 ? (
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandGroup heading="Test Group">
                <CommandItem onSelect={() => console.log("Clicked")} className="flex items-center gap-2">
                  <span>Alvvvays</span>
                  <Badge variant="outline" className="ml-auto">sniplist</Badge>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          ) : (
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
