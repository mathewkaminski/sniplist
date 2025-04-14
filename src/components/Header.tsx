
import { Button } from "@/components/ui/button";
import { PlusCircle, Home } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleHomeClick}
        >
          <Home className="h-6 w-6 text-purple-700" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-700">AudioSnippet</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Snippet
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
