import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './useAdminAuth';

export function useAuthRedirect(redirectTo: string = '/admin/login') {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}