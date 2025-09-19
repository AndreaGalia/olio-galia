'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminHeader from './AdminHeader';
import LoadingSpinner from './LoadingSpinner';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export default function AdminLayout({ children, title, subtitle, headerActions }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <LoadingSpinner message="Caricamento..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      <AdminHeader
        title={title}
        subtitle={subtitle}
        user={user}
        actions={headerActions}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}