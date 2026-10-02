import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  History,
  Bookmark,
  Sun,
  Moon,
  Laptop,
  PlayCircle,
  Cpu,
} from "lucide-react";
import { getActiveSession } from "@/services/storageService";
import { useEffect, useState } from "react";

export function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [hasActiveTest, setHasActiveTest] = useState(false);

  useEffect(() => {
    const active = getActiveSession();
    setHasActiveTest(!!active && !active.isCompleted);
  }, [location.pathname]);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const isLinkActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Cpu className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              IoT Exam Prep
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Offline Practice Portal
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/">
            <Button
              variant={isLinkActive("/") && !location.pathname.startsWith("/chapters") && !location.pathname.startsWith("/history") && !location.pathname.startsWith("/saved") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              Home
            </Button>
          </Link>

          <Link to="/chapters">
            <Button
              variant={isLinkActive("/chapters") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <BookOpen className="size-4" />
              <span>Chapters</span>
            </Button>
          </Link>

          <Link to="/history">
            <Button
              variant={isLinkActive("/history") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <History className="size-4" />
              <span className="hidden sm:inline">My History</span>
              <span className="sm:hidden">History</span>
            </Button>
          </Link>

          <Link to="/saved">
            <Button
              variant={isLinkActive("/saved") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <Bookmark className="size-4" />
              <span className="hidden sm:inline">Saved</span>
            </Button>
          </Link>

          {/* Active Test Shortcut (when not on /test) */}
          {hasActiveTest && location.pathname !== "/test" && (
            <Link to="/test" className="ml-1">
              <Badge
                variant="default"
                className="cursor-pointer gap-1.5 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <PlayCircle className="size-3.5" />
                <span>Resume Test</span>
              </Badge>
            </Link>
          )}

          {/* Theme switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-1 text-muted-foreground hover:text-foreground"
            title={`Current theme: ${theme}. Click to change.`}
          >
            {theme === "light" && <Sun className="size-4" />}
            {theme === "dark" && <Moon className="size-4" />}
            {theme === "system" && <Laptop className="size-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
