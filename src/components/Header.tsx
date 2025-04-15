
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
            <Home className="h-6 w-6 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-list")}
          >
            <ListMusic className="h-6 w-6 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/sniplists")}
          >
            <FileText className="h-6 w-6 text-black" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          className="text-2xl font-bold text-black hover:bg-transparent flex items-center gap-2"
          onClick={handleHomeClick}
        >
          <img 
            src="/lovable-uploads/eb22d499-0ec7-4fa4-b90f-04e62c935fa9.png" 
            alt="Sniplist Logo" 
            className="h-10 w-10"
          />
          Sniplist
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-black" onClick={() => navigate("/contact-us")}>
            <HelpCircle className="mr-2 h-4 w-4 text-black" />
            Help
          </Button>
          <Button variant="ghost" className="text-black">
            <PlusCircle className="mr-2 h-4 w-4 text-black" />
            Add Snippet
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
