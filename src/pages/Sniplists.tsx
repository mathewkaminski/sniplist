
import { useParams } from "react-router-dom";
import { useSniplistsData } from "@/hooks/useSniplistsData";
import { SniplistsList } from "@/components/sniplists/SniplistsList";
import { Header } from "@/components/Header";
import { SniplistsStatus } from "@/components/sniplists/SniplistsStatus";

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

          <SniplistsStatus 
            isPrivate={isPrivate}
            noSniplists={noSniplists}
            loading={loading}
            username={username}
            isCurrentUser={isCurrentUser}
          />

          {!isPrivate && (
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
