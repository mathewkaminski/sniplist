
import { useParams } from "react-router-dom";
import { useSniplistsData } from "@/hooks/useSniplistsData";
import { SniplistsList } from "@/components/sniplists/SniplistsList";
import { Header } from "@/components/Header";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Sniplists() {
  const { userId } = useParams<{ userId: string }>();
  
  // Log the actual userId value from params
  console.log("Loaded sniplists for userId:", userId);

  const {
    sniplists,
    loading,
    username,
    isPrivate,
    isCurrentUser,
    noSniplists,
    handleDelete
  } = useSniplistsData(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">
            {isCurrentUser ? "My Sniplists" : username ? `${username}'s Sniplists` : "Sniplists"}
          </h1>

          {isPrivate ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Private Profile</AlertTitle>
              <AlertDescription>
                This user's profile is private. You cannot view their sniplists.
              </AlertDescription>
            </Alert>
          ) : noSniplists ? (
            <Alert className="mb-4">
              <AlertTitle>No Sniplists Found</AlertTitle>
              <AlertDescription>
                {username || "This user"} hasn't created any sniplists yet.
              </AlertDescription>
            </Alert>
          ) : (
            <SniplistsList
              sniplists={sniplists}
              loading={loading}
              onDelete={isCurrentUser ? handleDelete : undefined}
            />
          )}
        </div>
      </main>
    </div>
  );
}
