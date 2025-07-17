'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Footer from '@/components/dashboard/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-shrink-0">
        <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
} 