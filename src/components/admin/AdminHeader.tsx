'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { AdminUser } from '@/types/admin';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  user: AdminUser;
  actions?: ReactNode;
}

export default function AdminHeader({ title, subtitle, user, actions }: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-serif text-olive truncate">{title}</h1>
            {subtitle && (
              <p className="text-nocciola mt-1 text-sm sm:text-base truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {actions}
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}