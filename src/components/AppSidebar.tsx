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
import { usePermissions } from '@/hooks/usePermissions';
import { ChevronDown, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VideoTutorialModal } from './VideoTutorialModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppSidebar() {
  const { t } = useTranslation('sidebar');
  const {
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile: isMobileContext,
  } = useSidebar();
  const isMobile = useIsMobile();
  const prevPathRef = useRef<string>();
  const { canRead, isLoading: permissionsLoading } = usePermissions();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Filter menu items based on read permission
  const filteredMenuCategories = menuCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => canRead(item.permission)),
    }))
    .filter((category) => category.items.length > 0);

  const filteredSystemMenu = {
    ...systemMenu,
    items: systemMenu.items.filter((item) => canRead(item.permission)),
  };

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
      [...filteredMenuCategories, filteredSystemMenu].forEach((category) => {
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
        <div className='flex items-center gap-2'>
          <Link to='/patients'>
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
          
          {/* Video Tutorial Button */}
          {open && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setVideoModalOpen(true)}
                    className='h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors'
                  >
                    <PlayCircle className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>{t('videoTutorial.tooltip', 'Video qo\'llanma')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Video button when sidebar is collapsed */}
        {!open && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setVideoModalOpen(true)}
                  className='absolute bottom-1 h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors'
                >
                  <PlayCircle className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p>{t('videoTutorial.tooltip', 'Video qo\'llanma')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <SidebarContent
        className={open ? 'px-2 py-4' : 'px-1 py-0 gap-0 overflow-y-auto'}
      >
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpen(!open)}
          className='rounded-full w-7 h-7 hover:bg-accent absolute right-[-22px] top-44 border-2 border-l-0 bg-white  max-md:hidden border-blue-400'
        >
          {open ? (
            <ChevronLeft className='w-7 h-7 scale-150 text-blue-500' />
          ) : (
            <ChevronRight className='w-7 h-7 scale-150 text-blue-500' />
          )}
        </Button>
        {/* Main Categories */}
        {filteredMenuCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <SidebarGroup key={category.id} className={open ? 'mb-2' : 'py-0'}>
              {open ? (
                <Collapsible
                  open={openCategories[category.id]}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className='w-full hover:bg-accent rounded-md transition-smooth group'>
                      <div className='flex items-center justify-between w-full py-2'>
                        <div className='flex items-center gap-3'>
                          <CategoryIcon className='w-[18px] h-[18px] text-muted-foreground' />
                          <span className='text-[12px] font-semibold text-muted-foreground uppercase tracking-wide'>
                            {t(category.titleKey)}
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
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <SidebarMenuItem key={item.url}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(item.url)}
                              >
                                <NavLink to={item.url} className='group'>
                                  <ItemIcon className='w-5 h-5' />
                                  <span>{t(item.titleKey)}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenu>
                  {category.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={t(item.titleKey)}
                        >
                          <NavLink
                            to={item.url}
                            className='group flex items-center justify-center h-8'
                          >
                            <ItemIcon className='w-5 h-5' />
                            <span>{t(item.titleKey)}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarGroup>
          );
        })}

        {/* System Settings - yopiq holatda scroll ichida */}
        {!open && filteredSystemMenu.items.length > 0 && (
          <SidebarGroup className='py-0 border-t pt-1'>
            <SidebarMenu className='space-y-0.5'>
              {filteredSystemMenu.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={t(item.titleKey)}
                    >
                      <NavLink
                        to={item.url}
                        className='group flex items-center justify-center h-8'
                      >
                        <ItemIcon className='w-5 h-5' />
                        <span>{t(item.titleKey)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* System Settings - ochiq holatda fixed bottom */}
      {open &&
        filteredSystemMenu.items.length > 0 &&
        (() => {
          const SystemIcon = filteredSystemMenu.icon;
          return (
            <SidebarFooter className='px-2 py-4 border-t'>
              <SidebarGroup>
                <Collapsible
                  open={openCategories[filteredSystemMenu.id]}
                  onOpenChange={() => toggleCategory(filteredSystemMenu.id)}
                >
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className='w-full hover:bg-accent rounded-md transition-smooth group'>
                      <div className='flex items-center justify-between w-full py-2'>
                        <div className='flex items-center gap-3'>
                          <SystemIcon className='w-[18px] h-[18px] text-muted-foreground' />
                          <span className='text-[12px] font-semibold text-muted-foreground uppercase tracking-wide'>
                            {t(filteredSystemMenu.titleKey)}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            openCategories[filteredSystemMenu.id]
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
                        {filteredSystemMenu.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <SidebarMenuItem key={item.url}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(item.url)}
                              >
                                <NavLink to={item.url} className='group'>
                                  <ItemIcon className='w-5 h-5' />
                                  <span>{t(item.titleKey)}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            </SidebarFooter>
          );
        })()}
        
      {/* Video Tutorial Modal */}
      <VideoTutorialModal 
        open={videoModalOpen} 
        onOpenChange={setVideoModalOpen} 
      />
    </Sidebar>
  );
}
