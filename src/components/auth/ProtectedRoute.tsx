import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Flame } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAuthSession } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      // If already marked authenticated, proceed
      if (isAuthenticated) {
        if (mounted) setIsVerifying(false);
        return;
      }
      
      const token = localStorage.getItem('thermotwin_token');
      if (!token) {
        if (mounted) setIsVerifying(false);
        return;
      }

      await checkAuthSession();
      if (mounted) setIsVerifying(false);
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, checkAuthSession]);

  if (isVerifying) {
    return (
      <div className="h-screen w-screen bg-[#0D0F0E] flex flex-col items-center justify-center gap-4 text-[#F5F5F5] font-mono">
        <div className="w-12 h-12 rounded-2xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green animate-pulse">
          <Flame className="w-6 h-6 text-[#39FF14]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-widest text-[#39FF14] font-bold">THERMOTWIN SECURITY</span>
          <span className="text-[11px] text-[#7C827C]">Verifying station credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login while saving requested path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
