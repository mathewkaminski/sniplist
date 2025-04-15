
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { Users, ListMusic } from "lucide-react";
import { toast } from "sonner";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading } = useSearch();
  const navigate = useNavigate();

  const handleSelect = (result: { type: string; id: string }) => {
    onOpenChange(false);
    if (result.type === 'profile') {
      navigate(`/profile/${result.id}`);
      toast.success(`Viewing profile`);
    } else {
      navigate(`/sniplists?play=${result.id}`);
      toast.success(`Playing sniplist`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <Command>
          <CommandInput
            placeholder="Search sniplists and users..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {results.length > 0 && (
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    {result.type === 'profile' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <ListMusic className="w-4 h-4" />
                    )}
                    <span>{result.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.type}
                    </span>
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
