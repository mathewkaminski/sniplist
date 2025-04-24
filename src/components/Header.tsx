
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, ListMusic, FileText, HelpCircle, Search, Heart } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SearchDialog } from "./search/SearchDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function Header() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useCurrentUser();

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleMySnippets = () => {
    if (user) {
      navigate(`/user/${user.id}/sniplists`);
    } else {
      navigate("/");
    }
  };

  const handleMySniplists = () => {
    if (user) {
      navigate("/snippets");
    } else {
      navigate("/");
    }
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
            onClick={handleMySnippets}
          >
            <FileText className="h-6 w-6 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMySniplists}
          >
            <ListMusic className="h-6 w-6 text-black" />
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/favorites')}
              title="My Favorites"
            >
              <Heart className="h-6 w-6 text-black" />
            </Button>
          )}
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" className="text-black hidden sm:flex" onClick={() => navigate("/contact-us")}>
            <HelpCircle className="mr-2 h-4 w-4 text-black" />
            Help
          </Button>
          <Button variant="ghost" className="text-black hidden sm:flex" onClick={handleHomeClick}>
            <PlusCircle className="mr-2 h-4 w-4 text-black" />
            Add Snippet
          </Button>
          <UserMenu />
        </div>
      </div>
      
      <SearchDialog 
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </header>
  );
}
