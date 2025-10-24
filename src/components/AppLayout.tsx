import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import ListIcon from '@/icons/ListIcon';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

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

  const navigator = [
    {
      path: '/dashboard',
      to: null,
      title: 'Бош саҳифа',
      icon: <ListIcon />,
    },
    {
      path: '/patients',
      to: null,
      title: 'Беморлар',
      icon: <ListIcon />,
    },
    {
      path: '/patient/:id',
      to: '/patients',
      title: 'Бемор профили',
      icon: <ListIcon />,
    },
    {
      path: '/new-visit',
      to: null,
      title: (
        <div>
          <h1 className='text-xl font-bold'>Янги Кўрик</h1>
          <p className='text-sm text-muted-foreground'>SOAP Ёзув</p>
        </div>
      ),
      icon: <ListIcon />,
    },
    {
      path: '/appointments',
      to: null,
      title: 'Учрашувлар',
      icon: <ListIcon />,
    },
    {
      path: '/prescription',
      to: null,
      title: 'Рецептлар',
      icon: <ListIcon />,
    },
    {
      path: '/lab-order',
      to: null,
      title: 'Лаборатория буюртмаси',
      icon: <ListIcon />,
    },
    {
      path: '/inpatient',
      to: null,
      title: 'Стационар',
      icon: <ListIcon />,
    },
    {
      path: '/lab-results',
      to: null,
      title: 'Таҳлил натижалари',
      icon: <ListIcon />,
    },
    {
      path: '/billing',
      to: null,
      title: 'Ҳисоб-китоб',
      icon: <ListIcon />,
    },
    {
      path: '/reports',
      to: null,
      title: 'Ҳисоботлар',
      icon: <ListIcon />,
    },
    {
      path: '/radiology',
      to: null,
      title: 'Рентген',
      icon: <ListIcon />,
    },
    {
      path: '/settings',
      to: null,
      title: 'Созламалар',
      icon: <ListIcon />,
    },
    {
      path: '/patient-portal',
      to: null,
      title: 'Бемор портали',
      icon: <ListIcon />,
    },
  ];

  const currentLocation = navigator.find((item) => {
    // Exact match for static routes
    if (item.path === location.pathname) return true;

    // Pattern match for dynamic routes (e.g., /patient/:id)
    const pattern = item.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(location.pathname);
  });

  console.log(location.pathname);
  console.log(currentLocation);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className='flex min-h-screen w-full'>
        <AppSidebar />
        <SidebarInset className='flex-1'>
          {/* Top Header */}
          <header className='sticky top-0 z-10 bg-card border-b card-shadow'>
            <div className='flex items-center justify-between px-6 py-4 lg:px-2'>
              <div className='flex items-center gap-4 md:px-6'>
                <SidebarTrigger className='md:hidden' />
                {currentLocation?.to && (
                  <Link to={currentLocation?.to}>
                    <ArrowLeft className='w-5 h-5' />
                  </Link>
                )}
                {/* {currentLocation?.icon && (
                  <div className='w-12 h-12 gradient-primary rounded-lg flex items-center justify-center'>
                    {currentLocation?.icon}
                  </div>
                )} */}
                <h1 className='text-xl font-bold'>
                  {currentLocation?.title || 'JAYRON MEDSERVIS'}
                </h1>
              </div>

              <div className='flex items-center gap-4'>
                <Button variant='ghost' size='icon' className='relative'>
                  <MessageSquare className='w-5 h-5' />
                  <span className='absolute -top-1 -right-1 w-5 h-5 gradient-danger rounded-full text-xs flex items-center justify-center text-white'>
                    3
                  </span>
                </Button>

                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold'>
                    ДА
                  </div>
                  <div className='hidden md:block text-right'>
                    <p className='text-sm font-medium'>Др. Алимов</p>
                    <p className='text-xs text-muted-foreground'>Терапевт</p>
                  </div>
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
