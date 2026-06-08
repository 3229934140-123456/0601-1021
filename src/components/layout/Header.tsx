import { Bell, Search, User, ChevronDown, RefreshCw, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useCRMStore } from '@/store/useCRMStore';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = useCRMStore(state => state.reminders.filter(r => !r.isRead).length);
  const refreshAll = useCRMStore(state => state.refreshAll);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshAll();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户、商机、联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>{today}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-primary-600 transition-colors"
          title="刷新数据"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-primary-600 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        <div className="h-8 w-px bg-slate-200" />
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium text-sm shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-slate-700">张主管</div>
            <div className="text-xs text-slate-500">销售总监</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
