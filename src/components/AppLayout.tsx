import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import getUser from '@/hooks/getUser/getUser';
import { navigator } from '@/router';
import { ArrowLeft, MessageSquare, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-state');
    return saved !== 'false';
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('sidebar-state', String(sidebarOpen));
  }, [sidebarOpen]);

  const currentLocation = navigator.find((item) => {
    if (item.path === location.pathname) return true;

    // Pattern match for dynamic routes (e.g., /patient/:id)
    const pattern = item.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(location.pathname);
  });

  const me = getUser();

  const nickName = me.fullname
    ?.split(' ')
    ?.map((i) => i[0])
    ?.join('');

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className='flex min-h-screen w-full'>
        <AppSidebar />
        <SidebarInset className='flex-1'>
          {/* Top Header */}
          <header className='sticky top-0 z-10 bg-card border-b card-shadow'>
            <div className='flex items-center justify-between px-6 py-4 lg:px-2 max-sm:pr-0'>
              <div className='flex items-center gap-4 md:px-4'>
                <SidebarTrigger className='md:hidden' />
                {currentLocation?.to && (
                  <Link to={currentLocation?.to}>
                    <ArrowLeft className='w-5 h-5' />
                  </Link>
                )}
                <h1 className='text-xl font-bold'>{currentLocation?.title}</h1>
              </div>
              <div className='flex items-center gap-4 px-4'>
                <Button variant='ghost' size='icon' className='relative'>
                  <MessageSquare className='w-5 h-5' />
                  <span className='absolute -top-1 -right-1 w-5 h-5 gradient-danger rounded-full text-xs flex items-center justify-center text-white'>
                    3
                  </span>
                </Button>
                <div className='flex items-center gap-3'>
                  {/* <div className='w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold'>
                    {nickName}
                  </div> */}
                  {/* <div className='hidden md:block text-right'>
                    <p className='text-sm font-medium'>{me.fullname}</p>
                    <p className='text-xs text-muted-foreground'>{me.role}</p>
                    <div className='mt-1'>
                      <Select defaultValue='uz'>
                        <SelectTrigger className='h-7 text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='uz'>Ўзбек тили</SelectItem>
                          <SelectItem value='ru'>Русский язык</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div> */}

                  <DropdownMenu>
                  <DropdownMenuTrigger className='focus-visible:ring-0 focus-visible:ring-offset-0' asChild>
                    <Button
                      variant='ghost'
                      className='flex items-center gap-3 hover:bg-accent'
                    >
                      <div className='w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold'>
                        {nickName}
                      </div>
                      <div className='hidden md:block text-right'>
                        <p className='text-sm font-medium'>{me.fullname}</p>
                        <p className='text-xs text-muted-foreground'>
                          {me.role}
                        </p>
                      </div>
                      <ChevronDown className='w-4 h-4 ml-2' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <span>Ўзбек тили</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Русский язык</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className='flex-1'>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
