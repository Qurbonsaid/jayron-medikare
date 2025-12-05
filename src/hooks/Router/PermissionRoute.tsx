import { usePermissions } from '@/hooks/usePermissions';
import { Loader2, ShieldX } from 'lucide-react';

interface PermissionRouteProps {
  permission: string | null;
  children: React.ReactNode;
}

export const PermissionRoute = ({
  permission,
  children,
}: PermissionRouteProps) => {
  const { canRead, isLoading } = usePermissions();

  // Loading holatida spinner ko'rsatish
  if (isLoading) {
    return (
      <div className='flex items-center justify-center w-full h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  // Permission null bo'lsa, har kim ko'ra oladi
  if (permission === null) {
    return <>{children}</>;
  }

  // canRead tekshirish
  if (!canRead(permission)) {
    return (
      <div className='flex flex-col items-center justify-center w-full h-[50vh] gap-4'>
        <ShieldX className='w-16 h-16 text-destructive' />
        <h1 className='text-2xl font-bold text-destructive'>Рухсат йўқ</h1>
        <p className='text-muted-foreground text-center max-w-md'>
          Сизда бу саҳифани кўриш учун рухсат йўқ. Илтимос, администратор билан
          боғланинг.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
