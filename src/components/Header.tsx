import { Link } from "react-router-dom";
import { BookOpen, LogOut, Upload, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            NoteHive
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/my-notes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">My Notes</span>
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="default" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Notes</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-32 truncate">
                  {user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
