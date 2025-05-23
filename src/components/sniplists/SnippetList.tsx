
import { Snippet } from "./types";
import { FavoriteButton } from "@/components/FavoriteButton";

interface SnippetListProps {
  snippets: Snippet[];
  currentSnippetIndex: number;
  onSnippetSelect: (index: number) => void;
}

export function SnippetList({ snippets, currentSnippetIndex, onSnippetSelect }: SnippetListProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {snippets.map((snippet, index) => (
        <div 
          key={snippet.id} 
          className={`flex-none cursor-pointer p-2 rounded ${index === currentSnippetIndex ? 'bg-gray-100 ring-1 ring-purple-400' : ''}`}
        >
          <div className="flex items-center gap-2">
            <div onClick={() => onSnippetSelect(index)}>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {snippet.title || 'Untitled'}
              </p>
              {snippet.comments && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {snippet.comments}
                </p>
              )}
            </div>
            <FavoriteButton 
              type="snippet" 
              id={snippet.id}
              className="ml-auto"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
