import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { menuCategories, systemMenu } from '@/constants/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';



export function AppSidebar() {
  const { open, setOpen, openMobile, setOpenMobile, isMobile: isMobileContext } = useSidebar();
  const isMobile = useIsMobile();
  const prevPathRef = useRef<string>();

  const location = useLocation();
  const currentPath = location.pathname;

  // Close sidebar on route change for mobile only
  useEffect(() => {
    // Skip if this is the first render (no previous path)
    if (prevPathRef.current === undefined) {
      prevPathRef.current = currentPath;
      return;
    }

    // Only close if path actually changed and we're on mobile
    if (prevPathRef.current !== currentPath && isMobile) {
      // Mobile: close the sheet
      setOpenMobile(false);
    }

    prevPathRef.current = currentPath;
  }, [currentPath, isMobile, isMobileContext, setOpenMobile]);

  // Track which categories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      // Load saved state from localStorage
      const saved = localStorage.getItem('sidebar-categories');
      if (saved) {
        return JSON.parse(saved);
      }

      // Find which category contains the current route and open it by default
      const defaultOpen: Record<string, boolean> = {};
      [...menuCategories, systemMenu].forEach((category) => {
        const hasActiveItem = category.items.some((item) =>
          currentPath.startsWith(item.url)
        );
        defaultOpen[category.id] = hasActiveItem;
      });
      return defaultOpen;
    }
  );

  // Save open categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sidebar-categories', JSON.stringify(openCategories));
  }, [openCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar collapsible='icon' className='border-r bg-card z-20'>
      {/* Logo Area */}
      <div className='h-18 flex items-center justify-center border-b relative'>
        <Link to='/dashboard'>
          {open ? (
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 gradient-primary rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <span className='font-bold text-sm'>JAYRON MEDSERVIS</span>
            </div>
          ) : (
            <div className='w-10 h-10 gradient-primary rounded-lg flex items-center justify-center z-10'>
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
          )}
        </Link>
      </div>

      <SidebarContent className={open ? 'px-2 py-4' : 'px-1 py-2 gap-0'}>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpen(!open)}
          className='rounded-full w-7 h-7 hover:bg-accent absolute right-[-22px] top-28 border-2 border-l-0 bg-white  max-md:hidden border-blue-400'
        >
          {open ? (
            <ChevronLeft className='w-7 h-7 scale-150 text-blue-500' />
          ) : (
            <ChevronRight className='w-7 h-7 scale-150 text-blue-500' />
          )}
        </Button>
        {/* Main Categories */}
        {menuCategories.map((category) => (
          <SidebarGroup key={category.id} className={open ? 'mb-2' : ''}>
            {open ? (
              <Collapsible
                open={openCategories[category.id]}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className='w-full hover:bg-accent rounded-md transition-smooth group'>
                    <div className='flex items-center justify-between w-full py-2'>
                      <div className='flex items-center gap-3'>
                        <category.icon className='w-[18px] h-[18px] text-muted-foreground' />
                        <span className='text-[12px] font-semibold text-muted-foreground uppercase tracking-wide'>
                          {category.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          openCategories[category.id]
                            ? 'rotate-180'
                            : 'rotate-0'
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {category.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <NavLink to={item.url} className='group'>
                              <item.icon className='w-5 h-5' />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenu className='space-y-1'>
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className='group flex items-center justify-center h-10'
                      >
                        <item.icon className='w-7 h-7' />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* System Settings at Bottom */}
      <SidebarFooter
        className={open ? 'px-2 py-4 border-t' : 'px-1 py-2 border-t'}
      >
        <SidebarGroup>
          {open ? (
            <Collapsible
              open={openCategories[systemMenu.id]}
              onOpenChange={() => toggleCategory(systemMenu.id)}
            >
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className='w-full hover:bg-accent rounded-md transition-smooth group'>
                  <div className='flex items-center justify-between w-full py-2'>
                    <div className='flex items-center gap-3'>
                      <systemMenu.icon className='w-[18px] h-[18px] text-muted-foreground' />
                      <span className='text-[12px] font-semibold text-muted-foreground uppercase tracking-wide'>
                        {systemMenu.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        openCategories[systemMenu.id]
                          ? 'rotate-180'
                          : 'rotate-0'
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {systemMenu.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                        >
                          <NavLink to={item.url} className='group'>
                            <item.icon className='w-7 h-7' />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenu className='space-y-1'>
              {systemMenu.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className='group flex items-center justify-center h-10'
                    >
                      <item.icon className='w-7 h-7' />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
