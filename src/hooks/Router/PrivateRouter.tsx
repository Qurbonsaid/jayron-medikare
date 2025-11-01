import { useMeQuery } from '@/app/api/authApi/authApi';
import { clearAuthTokens, getTokenFromCache } from '@/app/api/baseApi';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
  const token = getTokenFromCache();

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
    console.log('🚫 Access denied - redirecting to login');
    clearAuthTokens();
    return <Navigate to='/' replace />;
  }
  return <Outlet />;
};
