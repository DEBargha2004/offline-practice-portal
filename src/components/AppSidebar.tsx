import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  Home,
  BookOpen,
  History,
  Bookmark,
  Sun,
  Moon,
  Laptop,
  Flame,
  PlayCircle,
  Download,
} from "lucide-react";
import { getActiveSession } from "@/services/storageService";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { PwaInstallInstructionDialog } from "@/components/PwaInstallInstructionDialog";
import type { TestSession } from "@/types";
import { cn } from "cn";

export function AppSidebar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { setOpenMobile } = useSidebar();
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const {
    isInstalled,
    isIOS,
    installApp,
    showIOSInstruction,
    setShowIOSInstruction,
  } = usePwaInstall();

  useEffect(() => {
    const session = getActiveSession();
    if (session && !session.isCompleted) {
      setActiveSession(session);
    } else {
      setActiveSession(null);
    }
  }, [location.pathname]);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Chapters", path: "/chapters", icon: BookOpen, badge: "60" },
    { label: "My History", path: "/history", icon: History },
    { label: "Saved Questions", path: "/saved", icon: Bookmark },
  ];

  const isLinkActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  const answeredCount = activeSession
    ? Object.keys(activeSession.userAnswers).length
    : 0;
  const totalCount = activeSession ? activeSession.questionIds.length : 0;
  const progressPercent =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="md:hidden"
    >
      {/* Sidebar Header: App Identity */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Cpu className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              IoT Exam Prep
            </span>
            <span className="text-[11px] text-muted-foreground">
              Offline Practice Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Content: Navigation & Active Test */}
      <SidebarContent className="px-2 py-3 space-y-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      render={
                        <Link
                          to={item.path}
                          onClick={handleNavClick}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        />
                      }
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Active Test Callout in Sidebar */}
        {activeSession && location.pathname !== "/test" && (
          <SidebarGroup className="mx-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Flame className="size-4 text-amber-500" />
                <span>Active Session</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {progressPercent}%
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {activeSession.title}
            </p>

            <div className="mt-2.5 space-y-1.5">
              <Progress value={progressPercent} className="h-1.5 bg-muted/70" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {answeredCount} of {totalCount} answered
                </span>
                {activeSession.flaggedQuestionIds?.length > 0 && (
                  <span>
                    ★ {activeSession.flaggedQuestionIds.length} flagged
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/test"
              onClick={handleNavClick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
            >
              <PlayCircle className="size-3.5" />
              <span>Resume Test</span>
            </Link>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sidebar Footer: Theme Switcher & Status */}
      <SidebarFooter className="border-t border-sidebar-border p-3.5 space-y-3 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Theme</span>
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                theme === "light"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Light Mode"
              aria-label="Light Mode"
            >
              <Sun className="size-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                theme === "dark"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon className="size-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                theme === "system"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="System Theme"
              aria-label="System Theme"
            >
              <Laptop className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Simple Install App Button */}
        {!isInstalled && (
          <Button
            variant="outline"
            size="sm"
            onClick={installApp}
            className="w-full justify-center gap-2 h-9 text-xs font-semibold"
          >
            <Download className="size-3.5" />
            <span>Install App</span>
          </Button>
        )}
      </SidebarFooter>

      <PwaInstallInstructionDialog
        open={showIOSInstruction}
        onOpenChange={setShowIOSInstruction}
        isIOS={isIOS}
      />
    </Sidebar>
  );
}
