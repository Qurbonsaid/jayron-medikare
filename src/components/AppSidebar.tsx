import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  UserPlus,
  List,
  Stethoscope,
  FileEdit,
  Calendar,
  Pill,
  Microscope,
  TestTube,
  ClipboardCheck,
  ScanLine,
  BedDouble,
  PlusCircle,
  Wallet,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  UsersRound,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const menuCategories = [
  {
    id: "patients",
    title: "БЕМОРЛАР",
    icon: Users,
    items: [
      { title: "Беморлар рўйхати", url: "/patients", icon: List },
    ],
  },
  {
    id: "clinical",
    title: "КЎРИКЛАР",
    icon: Stethoscope,
    items: [
      { title: "Янги кўрик SOAP", url: "/new-visit", icon: FileEdit },
      { title: "Навбатлар", url: "/appointments", icon: Calendar },
      { title: "Рецепт ёзиш", url: "/prescription", icon: Pill },
    ],
  },
  {
    id: "diagnostics",
    title: "ДИАГНОСТИКА",
    icon: Microscope,
    items: [
      { title: "Таҳлил буюртмаси", url: "/lab-order", icon: TestTube },
      { title: "Таҳлил натижалари", url: "/lab-results", icon: ClipboardCheck },
      { title: "Рентген/МРТ/КТ", url: "/radiology", icon: ScanLine },
    ],
  },
  {
    id: "inpatient",
    title: "СТАЦИОНАР",
    icon: BedDouble,
    items: [
      { title: "Стационар бошқаруви", url: "/inpatient", icon: BedDouble },
    ],
  },
  {
    id: "finance",
    title: "МОЛИЯ",
    icon: Wallet,
    items: [
      { title: "Ҳисоб-китоб", url: "/billing", icon: Wallet },
    ],
  },
  {
    id: "reports",
    title: "ҲИСОБОТЛАР",
    icon: BarChart3,
    items: [
      { title: "Ҳисоботлар", url: "/reports", icon: BarChart3 },
    ],
  },
];

const systemMenu = {
  id: "system",
  title: "ТИЗИМ",
  icon: Settings,
  items: [
    { title: "Созламалар", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Track which categories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem("sidebar-categories");
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Find which category contains the current route and open it by default
    const defaultOpen: Record<string, boolean> = {};
    [...menuCategories, systemMenu].forEach((category) => {
      const hasActiveItem = category.items.some((item) => currentPath.startsWith(item.url));
      defaultOpen[category.id] = hasActiveItem;
    });
    return defaultOpen;
  });

  // Save open categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sidebar-categories", JSON.stringify(openCategories));
  }, [openCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b px-4">
        {open ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-sm">JAYRON MEDSERVIS</span>
          </div>
        ) : (
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-4">
        {/* Main Categories */}
        {menuCategories.map((category) => (
          <SidebarGroup key={category.id} className="mb-2">
            <Collapsible
              open={openCategories[category.id]}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full hover:bg-accent rounded-md transition-smooth group">
                  <div className="flex items-center justify-between w-full py-2">
                    <div className="flex items-center gap-3">
                      <category.icon className="w-[18px] h-[18px] text-muted-foreground" />
                      {open && (
                        <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {category.title}
                        </span>
                      )}
                    </div>
                    {open && (
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          openCategories[category.id] ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    )}
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} className="group">
                            <item.icon className="w-5 h-5" />
                            {open && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* System Settings at Bottom */}
      <SidebarFooter className="px-2 py-4 border-t">
        <SidebarGroup>
          <Collapsible
            open={openCategories[systemMenu.id]}
            onOpenChange={() => toggleCategory(systemMenu.id)}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="w-full hover:bg-accent rounded-md transition-smooth group">
                <div className="flex items-center justify-between w-full py-2">
                  <div className="flex items-center gap-3">
                    <systemMenu.icon className="w-[18px] h-[18px] text-muted-foreground" />
                    {open && (
                      <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {systemMenu.title}
                      </span>
                    )}
                  </div>
                  {open && (
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        openCategories[systemMenu.id] ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  )}
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemMenu.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} className="group">
                          <item.icon className="w-5 h-5" />
                          {open && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Toggle Button */}
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="rounded-full w-10 h-10"
          >
            {open ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
