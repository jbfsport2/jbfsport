"use client";

import { Suspense } from 'react';

function SimpleLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );
}

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export default function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <Suspense fallback={<SimpleLoading />}>
      {children}
    </Suspense>
  );
} 