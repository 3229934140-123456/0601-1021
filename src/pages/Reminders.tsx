import { useState, useMemo } from 'react';
import { Bell, Check, Calendar, User, AlertTriangle, Clock, Target, CheckCircle, Filter, UserCheck, X, MessageSquare, Search } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate, getPriorityColor, getPriorityLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function Reminders() {
  const { 
    teams,
    salesPeople,
    followUpFilters,
    setFollowUpFilters,
    reminderFilters,
    setReminderFilters,
    getFilteredReminders,
    getFilteredRemindersByScope,
    markReminderRead, 
    markReminderCompleted,
    markAllRemindersRead,
    reminders,
  } = useCRMStore();
  
  const [handleModal, setHandleModal] = useState<{ open: boolean; reminderId?: string }>({ open: false });
  const [handleNote, setHandleNote] = useState('');
  
  const filteredRemindersByScope = useMemo(
    () => getFilteredRemindersByScope(), 
    [getFilteredRemindersByScope, followUpFilters, reminders]
  );
  
  const filteredReminders = useMemo(
    () => getFilteredReminders(), 
    [getFilteredReminders, reminderFilters, followUpFilters, reminders]
  );
  
  const tabs = [
    { key: 'all' as const, label: '全部提醒', count: filteredRemindersByScope.filter(r => !r.isCompleted).length },
    { key: 'today' as const, label: '今日必访', count: filteredRemindersByScope.filter(r => r.type === 'visit' && !r.isCompleted).length },
    { key: 'high' as const, label: '高优先级', count: filteredRemindersByScope.filter(r => r.priority === 'high' && !r.isCompleted).length },
    { key: 'completed' as const, label: '已处理', count: filteredRemindersByScope.filter(r => r.isCompleted).length },
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
  
  const openHandleModal = (id: string) => {
    setHandleModal({ open: true, reminderId: id });
    setHandleNote('');
  };
  
  const confirmHandle = () => {
    if (handleModal.reminderId) {
      markReminderCompleted(handleModal.reminderId, handleNote || undefined);
    }
    setHandleModal({ open: false });
    setHandleNote('');
  };
  
  const handleRead = (id: string) => {
    markReminderRead(id);
  };
  
  const handleMarkAllRead = () => {
    markAllRemindersRead();
  };
  
  const handleTeamChange = (teamId: string) => {
    setFollowUpFilters({ teamId: teamId || undefined, salesPersonId: undefined });
  };
  
  const handleSalesPersonChange = (salesPersonId: string) => {
    setFollowUpFilters({ salesPersonId: salesPersonId || undefined });
  };
  
  const handleTypeChange = (type: string) => {
    setReminderFilters({ type });
  };
  
  const handleTabChange = (tab: 'all' | 'today' | 'high' | 'completed') => {
    setReminderFilters({ activeTab: tab });
  };
  
  const filteredSalesPeople = followUpFilters.teamId
    ? salesPeople.filter(sp => sp.teamId === followUpFilters.teamId)
    : salesPeople;
  
  const pendingCount = filteredRemindersByScope.filter(r => !r.isCompleted).length;
  const highPriorityCount = filteredRemindersByScope.filter(r => r.priority === 'high' && !r.isCompleted).length;
  const todayCount = filteredRemindersByScope.filter(r => r.type === 'visit' && !r.isCompleted).length;
  const completedCount = filteredRemindersByScope.filter(r => r.isCompleted).length;
  const unreadCount = filteredReminders.filter(r => !r.isRead && !r.isCompleted).length;
  
  const formatHandledAt = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">提醒中心</h1>
          <p className="text-sm text-slate-500 mt-1">查看和处理所有待办提醒事项</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={followUpFilters.teamId || ''}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            <option value="">全部团队</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={followUpFilters.salesPersonId || ''}
            onChange={(e) => handleSalesPersonChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            <option value="">全部人员</option>
            {filteredSalesPeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
          <select
            value={reminderFilters.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              unreadCount > 0
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            全部已读 {unreadCount > 0 && `(${unreadCount})`}
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
              <p className="text-2xl font-bold text-slate-600">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex items-center justify-between px-4">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    reminderFilters.activeTab === tab.key
                      ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    reminderFilters.activeTab === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索标题、内容、备注..."
                  value={reminderFilters.keyword || ''}
                  onChange={(e) => setReminderFilters({ keyword: e.target.value || undefined })}
                  className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 w-56"
                />
              </div>
            </div>
          </div>
        </div>
        
        {reminderFilters.activeTab === 'completed' && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">处理人</label>
                <select
                  value={reminderFilters.handledBy || ''}
                  onChange={(e) => setReminderFilters({ handledBy: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                >
                  <option value="">全部处理人</option>
                  {salesPeople.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">处理开始日期</label>
                <input
                  type="date"
                  value={reminderFilters.handleDateStart || ''}
                  onChange={(e) => setReminderFilters({ handleDateStart: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">处理结束日期</label>
                <input
                  type="date"
                  value={reminderFilters.handleDateEnd || ''}
                  onChange={(e) => setReminderFilters({ handleDateEnd: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setReminderFilters({ handledBy: undefined, handleDateStart: undefined, handleDateEnd: undefined })}
                  className="w-full px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-white transition-colors"
                >
                  重置筛选
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-slate-50">
          {filteredReminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className={cn(
                'p-4 transition-all',
                reminder.isRead ? 'bg-white' : 'bg-primary-50/30',
                reminder.isCompleted ? 'opacity-60' : 'hover:bg-slate-50 cursor-pointer'
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
                      
                      {reminder.isCompleted && reminder.handledAt && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <UserCheck className="w-4 h-4" />
                            <span className="font-medium text-slate-700">{reminder.handledBy || '系统'}</span>
                            <span>于 {formatHandledAt(reminder.handledAt)} 处理</span>
                          </div>
                          {reminder.handleNote && (
                            <div className="flex items-start gap-2 text-sm">
                              <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <p className="text-slate-600">{reminder.handleNote}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!reminder.isCompleted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openHandleModal(reminder.id);
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
      
      {handleModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">处理提醒</h3>
              <button
                onClick={() => setHandleModal({ open: false })}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  处理备注 <span className="text-slate-400 font-normal">（选填）</span>
                </label>
                <textarea
                  value={handleNote}
                  onChange={(e) => setHandleNote(e.target.value)}
                  placeholder="请输入处理备注，方便后续复盘..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setHandleModal({ open: false })}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmHandle}
                className="px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-success-500/30 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
