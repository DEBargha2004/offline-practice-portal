import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  History,
  Bookmark,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Menu,
  Home,
  Flame,
  Download,
} from "lucide-react";
import { getActiveSession } from "@/services/storageService";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { PwaInstallInstructionDialog } from "@/components/PwaInstallInstructionDialog";
import { cn } from "cn";

export function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const [hasActiveTest, setHasActiveTest] = useState(false);
  const [activeTestTitle, setActiveTestTitle] = useState("");
  const {
    isInstalled,
    isIOS,
    installApp,
    showIOSInstruction,
    setShowIOSInstruction,
  } = usePwaInstall();

  useEffect(() => {
    const active = getActiveSession();
    setHasActiveTest(!!active && !active.isCompleted);
    if (active && !active.isCompleted) {
      setActiveTestTitle(active.title);
    }
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

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Chapters", path: "/chapters", icon: BookOpen, badge: "60" },
    { label: "My History", path: "/history", icon: History },
    { label: "Saved", path: "/saved", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Sidebar Trigger + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Sidebar Hamburger (Triggers shadcn Sidebar) */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="md:hidden text-foreground hover:bg-muted size-9"
            aria-label="Open navigation sidebar"
          >
            <Menu className="size-5" />
          </Button>

          {/* Brand Link */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <Cpu className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground sm:text-lg">
                IoT Exam Prep
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                Offline Practice Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links (hidden on mobile, visible md and up) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 text-xs lg:text-sm font-medium transition-colors",
                    active && "font-semibold bg-secondary text-foreground shadow-2xs"
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Active Test Shortcut & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Active Test Pill - Adaptive for desktop and mobile */}
          {hasActiveTest && location.pathname !== "/test" && (
            <Link to="/test">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 px-2.5 sm:px-3 text-xs font-semibold shadow-2xs"
              >
                <Flame className="size-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline truncate max-w-[130px] lg:max-w-[200px]">
                  Resume: {activeTestTitle}
                </span>
                <span className="sm:hidden">Resume</span>
              </Button>
            </Link>
          )}

          {/* Install App Button if not installed */}
          {!isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={installApp}
              className="hidden sm:inline-flex h-8 gap-1.5 border-primary/30 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
              title="Install app for offline practice"
            >
              <Download className="size-3.5 text-primary" />
              <span>Install App</span>
            </Button>
          )}

          {/* Theme Switcher Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground size-8 sm:size-9"
            title={`Current theme: ${theme}. Click to switch.`}
            aria-label="Toggle theme mode"
          >
            {theme === "light" && <Sun className="size-4" />}
            {theme === "dark" && <Moon className="size-4" />}
            {theme === "system" && <Laptop className="size-4" />}
          </Button>
        </div>
      </div>

      <PwaInstallInstructionDialog
        open={showIOSInstruction}
        onOpenChange={setShowIOSInstruction}
        isIOS={isIOS}
      />
    </header>
  );
}
