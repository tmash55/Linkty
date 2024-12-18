"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import { cn } from "@/lib/utils";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import CreateFolderDialog from "./CreateFolderDialog";
import {
  Lightbulb,
  LinkIcon,
  LayoutDashboard,
  User,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Folder,
  Globe,
  ChevronDown,
  MessageSquare,
  Map,
  BarChart3,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "All Links", href: "/links", icon: LinkIcon },
  { name: "Domains", href: "/domains/new", icon: Globe },
];

interface NavButtonProps {
  href: string;
  icon: React.ElementType;
  name: string;
  onClick?: () => void;
  active?: boolean;
  onNavigation?: () => void;
}

interface AnimatedIconProps {
  icon: React.ElementType;
  className?: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon: Icon,
  className = "",
}) => {
  return (
    <div className="group relative">
      <Icon
        className={`transition-all duration-300 ease-in-out ${className}`}
      />
      <Icon
        className={`absolute top-0 left-0 opacity-0 scale-125 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100 ${className}`}
      />
    </div>
  );
};

export default function SideNav2() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [supabase]);

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("id, name")
      .order("name");
    if (data) setFolders(data);
    if (error) console.error("Error fetching folders:", error);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    const { data, error } = await supabase
      .from("folders")
      .insert({ name: folderName, user_id: user.id })
      .select();

    if (error) {
      console.error("Error creating folder:", error);
    } else if (data) {
      setFolders([...folders, data[0]]);
    }
    setIsCreateFolderOpen(false);
  };

  const NavButton = ({
    href,
    icon: Icon,
    name,
    onClick,
    active,
    onNavigation,
  }: NavButtonProps) => {
    const { state: sidebarState } = useSidebar();

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={active ? "secondary" : "ghost"}
              className={cn(
                "w-full",
                sidebarState === "collapsed" && !isMobile
                  ? "justify-center"
                  : "justify-start"
              )}
              onClick={() => {
                if (onClick) {
                  onClick();
                }
                if (onNavigation) {
                  onNavigation();
                }
              }}
              asChild={!onClick}
            >
              {onClick ? (
                <div className="flex items-center">
                  <AnimatedIcon icon={Icon} className="h-4 w-4" />
                  {(sidebarState !== "collapsed" || isMobile) && (
                    <span className="ml-2">{name}</span>
                  )}
                </div>
              ) : (
                <Link href={href} className="flex items-center w-full">
                  <AnimatedIcon icon={Icon} className="h-4 w-4" />
                  {(sidebarState !== "collapsed" || isMobile) && (
                    <span className="ml-2">{name}</span>
                  )}
                </Link>
              )}
            </Button>
          </TooltipTrigger>
          {sidebarState === "collapsed" && !isMobile && (
            <TooltipContent side="right">{name}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  const NavContent = () => {
    const { state: sidebarState } = useSidebar();

    return (
      <>
        <SidebarHeader className="mb-6">
          <div
            className={cn(
              "flex items-center",
              sidebarState === "collapsed" && !isMobile
                ? "justify-center"
                : "justify-between"
            )}
          >
            {(sidebarState !== "collapsed" || isMobile) && (
              <div className="flex items-center">
                <div className="bg-primary rounded-full p-2 mr-2">
                  <Lightbulb className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">{config.appName}</span>
              </div>
            )}
            {!isMobile && (
              <SidebarTrigger>
                {sidebarState === "collapsed" ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </SidebarTrigger>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <NavButton
            href="/links/new"
            icon={PlusCircle}
            name="Create New Link"
            active={pathname === "/links/new"}
            onNavigation={() => setIsOpen(false)}
          />

          <Collapsible
            open={isFoldersOpen}
            onOpenChange={setIsFoldersOpen}
            className="mt-4"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between",
                  sidebarState === "collapsed" && !isMobile ? "px-2" : "px-4"
                )}
              >
                <div className="flex items-center">
                  <AnimatedIcon icon={Folder} className="h-4 w-4 mr-2" />
                  {(sidebarState !== "collapsed" || isMobile) && (
                    <span>Folders</span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isFoldersOpen ? "transform rotate-180" : ""
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {folders.map((folder) => (
                <NavButton
                  key={folder.id}
                  href={`/folders/${folder.id}`}
                  icon={Folder}
                  name={folder.name}
                  active={pathname === `/folders/${folder.id}`}
                  onNavigation={() => setIsOpen(false)}
                />
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setIsCreateFolderOpen(true)}
              >
                <AnimatedIcon icon={PlusCircle} className="h-4 w-4 mr-2" />
                {(sidebarState !== "collapsed" || isMobile) && (
                  <span>Create New Folder</span>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <nav className="space-y-2 flex-grow mt-4">
            {navItems.map((item) => (
              <NavButton
                key={item.name}
                href={item.href}
                icon={item.icon}
                name={item.name}
                active={pathname === item.href}
                onNavigation={() => setIsOpen(false)}
              />
            ))}
          </nav>
        </SidebarContent>

        <SidebarFooter>
          <NavButton
            href="/feedback"
            icon={MessageSquare}
            name="Feedback"
            active={pathname === "/feedback"}
            onNavigation={() => setIsOpen(false)}
          />
          <NavButton
            href="/roadmap"
            icon={Map}
            name="Roadmap"
            active={pathname === "/roadmap"}
            onNavigation={() => setIsOpen(false)}
          />
          <NavButton
            href="/account"
            icon={User}
            name="Account"
            active={pathname === "/account"}
            onNavigation={() => setIsOpen(false)}
          />
          <NavButton
            href="#"
            icon={LogOut}
            name="Logout"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
          />
        </SidebarFooter>
      </>
    );
  };

  return (
    <SidebarProvider>
      {isMobile ? (
        <div className="fixed top-0 left-0 z-40 w-full bg-background p-4 flex justify-between items-center md:hidden">
          <div className="flex items-center">
            <div className="bg-primary rounded-full p-2 mr-2">
              <Lightbulb className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">{config.appName}</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <Sidebar className="border-r-0">
                <NavContent />
              </Sidebar>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <Sidebar className="hidden md:flex">
          <NavContent />
        </Sidebar>
      )}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
    </SidebarProvider>
  );
}
