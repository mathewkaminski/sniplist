
import { useState } from "react";
import { SnippetList } from "./SnippetList";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { Snippet } from "./types";

interface MySnippetsListProps {
  snippets: Snippet[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  isSelecting: boolean;
  selectedSnippets: string[];
  onSnippetSelect: (id: string) => void;
  onCreateSniplist: () => void;
  onCancelSelection: () => void;
  onStartSelection: () => void;
}

export function MySnippetsList({
  snippets,
  loading,
  onDelete,
  onEdit,
  isSelecting,
  selectedSnippets,
  onSnippetSelect,
  onCreateSniplist,
  onCancelSelection,
  onStartSelection,
}: MySnippetsListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Snippets</h1>
          <div className="flex gap-2">
            {isSelecting ? (
              <>
                <Button variant="outline" onClick={onCancelSelection}>
                  Cancel
                </Button>
                <Button
                  onClick={onCreateSniplist}
                  disabled={selectedSnippets.length === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Create Sniplist ({selectedSnippets.length})
                </Button>
              </>
            ) : (
              <Button onClick={onStartSelection}>
                <Plus className="mr-2 h-4 w-4" />
                Create a Sniplist
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <p>Loading snippets...</p>
        ) : snippets.length === 0 ? (
          <p className="text-gray-500">No snippets saved yet.</p>
        ) : (
          <SnippetList 
            snippets={snippets}
            onDelete={onDelete}
            onEdit={onEdit}
            isSelecting={isSelecting}
            selectedSnippets={selectedSnippets}
            onSnippetSelect={onSnippetSelect}
          />
        )}
      </div>
    </div>
  );
}
