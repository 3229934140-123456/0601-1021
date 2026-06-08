import { useState } from 'react';
import { Bell, Check, Calendar, User, AlertTriangle, Clock, Target, CheckCircle, Filter } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate, getPriorityColor, getPriorityLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

type TabType = 'all' | 'today' | 'high' | 'completed';

export default function Reminders() {
  const { reminders, markReminderRead, markReminderCompleted } = useCRMStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '全部提醒', count: reminders.length },
    { key: 'today', label: '今日必访', count: reminders.filter(r => r.type === 'visit').length },
    { key: 'high', label: '高优先级', count: reminders.filter(r => r.priority === 'high' && !r.isCompleted).length },
    { key: 'completed', label: '已处理', count: reminders.filter(r => r.isCompleted).length },
  ];
  
  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'visit', label: '拜访提醒' },
    { value: 'follow_up', label: '跟进提醒' },
    { value: 'deadline', label: '期限提醒' },
    { value: 'contact', label: '联系人补充' },
  ];
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Target className="w-5 h-5" />;
      case 'follow_up': return <Calendar className="w-5 h-5" />;
      case 'deadline': return <AlertTriangle className="w-5 h-5" />;
      case 'contact': return <User className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'visit': return '拜访提醒';
      case 'follow_up': return '跟进提醒';
      case 'deadline': return '期限提醒';
      case 'contact': return '联系人补充';
      default: return '系统提醒';
    }
  };
  
  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'today' && r.type !== 'visit') return false;
    if (activeTab === 'high' && r.priority !== 'high') return false;
    if (activeTab === 'completed' && !r.isCompleted) return false;
    if (activeTab !== 'completed' && r.isCompleted) return false;
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    return true;
  });
  
  const handleComplete = (id: string) => {
    markReminderCompleted(id);
  };
  
  const handleRead = (id: string) => {
    markReminderRead(id);
  };
  
  const pendingCount = reminders.filter(r => !r.isCompleted).length;
  const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.isCompleted).length;
  const todayCount = reminders.filter(r => r.type === 'visit' && !r.isCompleted).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">提醒中心</h1>
          <p className="text-sm text-slate-500 mt-1">查看和处理所有待办提醒事项</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all">
            全部已读
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待处理</p>
              <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">高优先级</p>
              <p className="text-2xl font-bold text-danger-600">{highPriorityCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">今日必访</p>
              <p className="text-2xl font-bold text-success-600">{todayCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已处理</p>
              <p className="text-2xl font-bold text-slate-600">{reminders.filter(r => r.isCompleted).length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="divide-y divide-slate-50">
          {filteredReminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className={cn(
                'p-4 transition-all',
                reminder.isRead ? 'bg-white' : 'bg-primary-50/30',
                reminder.isCompleted ? 'opacity-60' : 'hover:bg-slate-50'
              )}
              onClick={() => !reminder.isRead && handleRead(reminder.id)}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  reminder.priority === 'high' ? 'bg-danger-50 text-danger-500' :
                  reminder.priority === 'medium' ? 'bg-warning-50 text-warning-500' :
                  'bg-slate-100 text-slate-500'
                )}>
                  {getTypeIcon(reminder.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {!reminder.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                        )}
                        <h4 className={cn(
                          'font-medium',
                          reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                        )}>
                          {reminder.title}
                        </h4>
                      </div>
                      
                      <p className={cn(
                        'text-sm mt-1',
                        reminder.isCompleted ? 'text-slate-400' : 'text-slate-600'
                      )}>
                        {reminder.content}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className={cn('px-2 py-0.5 rounded-full', getPriorityColor(reminder.priority))}>
                          {getPriorityLabel(reminder.priority)}
                        </span>
                        <span>{getTypeLabel(reminder.type)}</span>
                        <span>负责人：{reminder.salesPersonName}</span>
                        {reminder.customerName && <span>客户：{reminder.customerName}</span>}
                        <span>到期：{formatDate(reminder.dueDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!reminder.isCompleted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(reminder.id);
                          }}
                          className="px-3 py-1.5 bg-success-500 text-white text-sm rounded-lg hover:bg-success-600 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          处理
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-sm rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          已处理
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredReminders.length === 0 && (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无提醒事项</p>
            </div>
          )}
        </div>
        
        {filteredReminders.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              共 {filteredReminders.length} 条记录
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors">
                上一页
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors">
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
