'use client';

import { ReactNode, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6">
          <div className="flex-1 min-w-0 mr-4">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-serif text-olive truncate">{title}</h1>
            {subtitle && (
              <p className="hidden sm:block text-nocciola mt-1 text-sm lg:text-base truncate">{subtitle}</p>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {actions}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-sm lg:text-base whitespace-nowrap"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-olive hover:bg-olive/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-olive/10 pt-4 animate-in slide-in-from-top duration-200">
            {actions && (
              <div className="flex flex-col space-y-2 pb-2 mb-2 border-b border-olive/10">
                {actions}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}