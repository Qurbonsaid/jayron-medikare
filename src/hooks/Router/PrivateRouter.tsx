import { useMeQuery } from '@/app/api/authApi/authApi';
import { clearAuthTokens, getTokenFromCache } from '@/app/api/baseApi';
import { routers } from '@/constants/router';
import { Loader2 } from 'lucide-react';
import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom';

export const PrivateRoute = () => {
  const token = getTokenFromCache();
  const location = useLocation();

  // Skip API call if no token exists
  const {
    data: userData,
    isLoading: userLoading,
    isError,
  } = useMeQuery(undefined, {
    skip: !token,
  });

  // Show loading spinner while checking authentication
  if (userLoading) {
    return (
      <div className='fixed z-50 top-0 left-0 bg-white flex items-center justify-center w-full h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  // If no token, error, or no user data, redirect to login
  if (!token || isError || !userData) {
    console.log('🚫 Authentication failed - redirecting to login');
    clearAuthTokens();
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  // Check role-based authorization
  // const currentRoute = routers.find((r) => {
  //   // Use matchPath for dynamic routes like /patient/:id
  //   return matchPath(r.path, location.pathname);
  // });

  // if (currentRoute && userData.data.role) {
  //   const hasPermission = currentRoute.permission.includes(userData.data.role);

  //   if (!hasPermission) {
  //     console.warn(
  //       `🔒 Access denied for role: ${userData.data.role} on path: ${location.pathname}`
  //     );
  //     return <Navigate to='/patients' replace />;
  //   }
  // }

  return <Outlet />;
};
