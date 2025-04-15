
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface SniplistsStatusProps {
  isPrivate: boolean;
  noSniplists: boolean;
  loading: boolean;
  username: string | null;
  isCurrentUser: boolean;
}

export function SniplistsStatus({ 
  isPrivate, 
  noSniplists, 
  loading, 
  username, 
  isCurrentUser 
}: SniplistsStatusProps) {
  if (isPrivate) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Private Profile</AlertTitle>
        <AlertDescription>
          This user's profile is private. You cannot view their sniplists.
        </AlertDescription>
      </Alert>
    );
  }

  if (noSniplists && !loading) {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>No Sniplists Found</AlertTitle>
        <AlertDescription>
          {isCurrentUser 
            ? "You haven't created any sniplists yet."
            : username
              ? `${username} hasn't created any sniplists yet.`
              : "No sniplists found."
          }
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
