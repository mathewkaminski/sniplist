
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { Users, ListMusic, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading, hasMinimumChars } = useSearch();
  const navigate = useNavigate();

  // Debug logging for component state
  useEffect(() => {
    console.log("SearchDialog state:", { 
      searchTerm, 
      resultsCount: results?.length || 0, 
      isLoading, 
      hasMinimumChars 
    });
  }, [searchTerm, results, isLoading, hasMinimumChars]);

  const handleSelect = (result: { type: string; id: string }) => {
    onOpenChange(false);
    setSearchTerm(''); // Reset search term when selecting a result
    
    if (result.type === 'profile') {
      navigate(`/profile/${result.id}`);
      toast.success(`Viewing profile`);
    } else {
      navigate(`/sniplists?play=${result.id}`);
      toast.success(`Playing sniplist`);
    }
  };

  // Make sure results is always an array before filtering
  const safeResults = Array.isArray(results) ? results : [];
  
  // Group results by type
  const profileResults = safeResults.filter(result => result.type === 'profile');
  const sniplistResults = safeResults.filter(result => result.type === 'sniplist');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setSearchTerm(''); // Clear search when closing dialog
      onOpenChange(isOpen);
    }}>
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
          <CommandList>
            {!hasMinimumChars && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
            
            {hasMinimumChars && !isLoading && safeResults.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            
            {hasMinimumChars && isLoading && (
              <div className="py-6 text-center text-sm">
                Searching...
              </div>
            )}
            
            {profileResults.length > 0 && (
              <CommandGroup heading="Users">
                {profileResults.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{result.title}</span>
                    <Badge variant="outline" className="ml-auto">Profile</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {profileResults.length > 0 && sniplistResults.length > 0 && (
              <Separator className="my-1" />
            )}
            
            {sniplistResults.length > 0 && (
              <CommandGroup heading="Sniplists">
                {sniplistResults.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    <ListMusic className="w-4 h-4 text-green-500" />
                    <span>{result.title}</span>
                    <Badge variant="outline" className="ml-auto">Sniplist</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
