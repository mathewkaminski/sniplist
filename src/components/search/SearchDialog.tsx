
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
import { SearchIcon, User, ListMusic, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading, hasMinimumChars } = useSearch();
  const navigate = useNavigate();

  const safeResults: SearchResult[] = results.filter(
    (r): r is SearchResult => !!r?.title && !!r?.id && !!r?.type
  );

  const shouldRenderResults = hasMinimumChars && safeResults.length > 0;

  useEffect(() => {
    console.log("🔍 SearchDialog state:", {
      searchTerm,
      resultsCount: results?.length || 0,
      isLoading,
      hasMinimumChars,
      shouldRenderResults,
      results,
      safeResults,
    });
  }, [searchTerm, results, isLoading, hasMinimumChars, shouldRenderResults]);

  const handleSelect = (result: SearchResult) => {
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
      <DialogContent className="max-w-md p-0 bg-white shadow-xl overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command>
          <div className="flex items-center border-b px-3 py-2">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search sniplists and users..."
              value={searchTerm}
              onValueChange={(value) => {
                console.log("📝 Input changed:", value);
                setSearchTerm(value);
              }}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </div>
            )}

            {!isLoading && hasMinimumChars && safeResults.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No results found
              </div>
            )}

            {shouldRenderResults && (
              <CommandGroup heading="Results">
                {safeResults.map((result, idx) => (
                  <CommandItem
                    key={`${result.type}-${result.id}-${idx}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {result.type.toLowerCase() === "profile" ? (
                      <User className="h-4 w-4 opacity-70" />
                    ) : (
                      <ListMusic className="h-4 w-4 opacity-70" />
                    )}
                    <span className="flex-1 truncate">{result.title}</span>
                    <Badge variant="outline" className="ml-auto">
                      {result.type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!hasMinimumChars && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Type at least 3 characters to search
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
