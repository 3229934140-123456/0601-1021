import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  TrendingUp,
  Bell,
  UserPlus,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCRMStore } from '@/store/useCRMStore';

const menuItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/customer-scan', label: '客户扫描', icon: Users },
  { path: '/follow-up-check', label: '跟进检查', icon: ClipboardCheck },
  { path: '/opportunity-score', label: '商机评分', icon: TrendingUp },
  { path: '/reminders', label: '提醒中心', icon: Bell },
  { path: '/lead-assignment', label: '线索分配', icon: UserPlus },
  { path: '/exception-summary', label: '异常汇总', icon: AlertTriangle },
  { path: '/reports', label: '数据报表', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { reminders, getFilteredRemindersByScope } = useCRMStore();
  
  const unreadCount = useMemo(() => {
    return reminders.filter(r => !r.isRead).length;
  }, [reminders]);
  
  const todayTodoCount = useMemo(() => {
    return reminders.filter(r => {
      if (r.isCompleted) return false;
      return r.type === 'visit' || r.type === 'follow_up' || r.type === 'deadline';
    }).length;
  }, [reminders]);
  
  const highPriorityCount = useMemo(() => {
    return reminders.filter(r => !r.isCompleted && r.priority === 'high').length;
  }, [reminders]);
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-gradient-to-b from-primary-900 to-primary-950 text-white transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn(
        'h-16 flex items-center border-b border-primary-800/50 px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center font-bold text-lg shadow-lg">
              CRM
            </div>
            <div>
              <div className="font-bold text-sm">CRM 自动化</div>
              <div className="text-xs text-primary-300">客户关系管理</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center font-bold text-sm shadow-lg">
            C
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    collapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-gradient-to-r from-accent-500/20 to-primary-600/20 text-accent-300 border-l-2 border-accent-400'
                      : 'text-primary-200 hover:bg-primary-800/40 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isActive ? 'text-accent-400' : 'group-hover:scale-110'
                  )} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {!collapsed && item.path === '/reminders' && unreadCount > 0 && (
                    <span className="ml-auto bg-warning-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
        
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-primary-800/50">
            <div className="px-3 mb-2">
              <span className="text-xs text-primary-400 font-medium uppercase tracking-wider">快速统计</span>
            </div>
            <div className="space-y-2 px-3">
              <div className="flex justify-between text-sm">
                <span className="text-primary-300">今日待办</span>
                <span className="text-accent-400 font-semibold">{todayTodoCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-300">高优先级</span>
                <span className="text-warning-400 font-semibold">{highPriorityCount}</span>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary-700 border-2 border-primary-900 flex items-center justify-center text-primary-200 hover:bg-primary-600 hover:text-white transition-colors shadow-md',
          collapsed ? 'rotate-180' : ''
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </aside>
  );
}
