iimport { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export function SearchDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border p-6 shadow-xl max-w-md">
        <h2 className="text-xl font-bold mb-4">Dialog Test</h2>
        <Command>
          <CommandList className="max-h-[300px] overflow-y-auto border bg-gray-100">
            <CommandGroup heading="Test Group">
              <CommandItem
                onSelect={() => console.log("Clicked")}
                className="flex items-center gap-2"
              >
                <span>Alvvvays</span>
                <Badge variant="outline" className="ml-auto">sniplist</Badge>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
