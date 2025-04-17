
import { Header } from "@/components/Header";
import { EditTitleDialog } from "@/components/snippets/EditTitleDialog";
import { CreateSniplistDialog } from "@/components/snippets/CreateSniplistDialog";
import { MySnippetsList } from "@/components/snippets/MySnippetsList";
import { useSnippets } from "@/hooks/useSnippets";

export default function MyList() {
  const {
    snippets,
    loading,
    editingTitle,
    editingArtist,
    dialogOpen,
    isSelecting,
    selectedSnippets,
    createSniplistOpen,
    setEditingTitle,
    setEditingArtist,
    setDialogOpen,
    setCreateSniplistOpen,
    handleDelete,
    handleUpdateDetails,
    openEditDialog,
    handleCreateSniplistSuccess,
    toggleSnippetSelection,
    setIsSelecting,
    setSelectedSnippets
  } = useSnippets();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MySnippetsList 
          snippets={snippets}
          loading={loading}
          onDelete={handleDelete}
          onEdit={openEditDialog}
          isSelecting={isSelecting}
          selectedSnippets={selectedSnippets}
          onSnippetSelect={toggleSnippetSelection}
          onCreateSniplist={() => setCreateSniplistOpen(true)}
          onCancelSelection={() => {
            setIsSelecting(false);
            setSelectedSnippets([]);
          }}
          onStartSelection={() => setIsSelecting(true)}
        />
      </main>

      <EditTitleDialog
        open={dialogOpen}
        title={editingTitle}
        comments={editingArtist}
        onOpenChange={setDialogOpen}
        onSave={handleUpdateDetails}
        onTitleChange={setEditingTitle}
        onArtistChange={setEditingArtist}
      />

      <CreateSniplistDialog
        open={createSniplistOpen}
        onOpenChange={setCreateSniplistOpen}
        selectedSnippets={selectedSnippets}
        onSuccess={handleCreateSniplistSuccess}
      />
    </div>
  );
}
