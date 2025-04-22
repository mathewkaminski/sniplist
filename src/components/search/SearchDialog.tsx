
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, User, ListMusic, Loader } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const safeResults = Array.isArray(results)
    ? results.filter(
        (r): r is SearchResult =>
          !!r &&
          typeof r === "object" &&
          !!r.title &&
          !!r.id &&
          !!r.type
      )
    : [];

  function handleSelect(result: SearchResult) {
    onOpenChange(false);
    setSearchTerm("");
    if (result.type.toLowerCase() === "profile") {
      navigate(`/profile/${result.id}`);
      toast.success("Viewing profile");
    } else {
      navigate(`/sniplists?play=${result.id}`);
      toast.success("Playing sniplist");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setSearchTerm("");
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-md p-0 bg-white shadow-xl overflow-hidden flex flex-col items-stretch">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            placeholder="Search sniplists and users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            autoFocus
          />
        </div>
        <div className="p-4 overflow-y-auto min-h-[60px] max-h-[300px]">
          {isLoading && (
            <div className="flex gap-2 items-center text-muted-foreground animate-fade-in">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}
          {!isLoading && !hasMinimumChars && (
            <div className="text-muted-foreground text-center">
              Type at least 3 characters to search
            </div>
          )}
          {!isLoading && hasMinimumChars && safeResults.length === 0 && (
            <div className="text-muted-foreground text-center">
              No results found
            </div>
          )}
          {!isLoading && hasMinimumChars && safeResults.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {safeResults.map(result => (
                <li
                  key={`${result.type}-${result.id}`}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded transition"
                  onClick={() => handleSelect(result)}
                >
                  {result.type.toLowerCase() === "profile" ? (
                    <User className="h-4 w-4 opacity-70" />
                  ) : (
                    <ListMusic className="h-4 w-4 opacity-70" />
                  )}
                  <span className="flex-1 truncate">{result.title}</span>
                  <Badge variant="outline">{result.type}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

