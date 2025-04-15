
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, ListMusic, FileText, HelpCircle } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleHomeClick}
          >
            <Home className="h-6 w-6 text-purple-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-list")}
          >
            <ListMusic className="h-6 w-6 text-purple-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/sniplists")}
          >
            <FileText className="h-6 w-6 text-purple-700" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          className="text-2xl font-bold text-purple-700 hover:bg-transparent flex items-center gap-2"
          onClick={handleHomeClick}
        >
          <img 
            src="/lovable-uploads/484c4368-6966-4be2-9e37-7e19f30ea508.png" 
            alt="Sniplist Logo" 
            className="h-8 w-8"
          />
          Sniplist
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/contact-us")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
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
