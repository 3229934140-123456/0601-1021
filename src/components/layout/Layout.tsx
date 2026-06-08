import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setPageVisible(false);
    const timer = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Header />
        
        <main className={cn(
          'p-6 transition-opacity duration-300',
          pageVisible ? 'opacity-100' : 'opacity-0'
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
