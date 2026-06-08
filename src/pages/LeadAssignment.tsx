import { useState } from 'react';
import { UserPlus, Users, Shuffle, BarChart3, ArrowRight, Check, RefreshCw, Download, History, Filter } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function LeadAssignment() {
  const { 
    leads, 
    salesPeople, 
    assignLead, 
    batchAssignLeads,
    assignmentRecords,
    getFilteredAssignments,
    assignmentFilters,
    setAssignmentFilters,
  } = useCRMStore();
  const [selectedStrategy, setSelectedStrategy] = useState<'round_robin' | 'load_balance' | 'industry_match'>('load_balance');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const newLeads = leads.filter(l => l.status === 'new');
  const assignedLeads = leads.filter(l => l.status === 'assigned');
  const contactedLeads = leads.filter(l => l.status === 'contacted');
  
  const activeSales = salesPeople.filter(s => s.role === 'sales');
  const filteredAssignments = getFilteredAssignments();
  
  const handleBatchAssign = () => {
    setIsAssigning(true);
    setTimeout(() => {
      batchAssignLeads(selectedStrategy);
      setIsAssigning(false);
    }, 1000);
  };
  
  const handleExportRecords = () => {
    const records = filteredAssignments;
    const csv = [
      ['分配时间', '线索名称', '公司', '分配给', '分配策略', '操作人'],
      ...records.map(r => [
        formatDate(r.assignedAt),
        r.leadName,
        r.leadCompany,
        r.salesPersonName,
        strategyLabels[r.strategy] || r.strategy,
        r.assignedBy,
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `分配记录_${new Date().toLocaleDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const strategyLabels: Record<string, string> = {
    round_robin: '轮询分配',
    load_balance: '负载均衡',
    industry_match: '行业匹配',
    manual: '手动分配',
  };
  
  const strategies = [
    { key: 'round_robin', label: '轮询分配', desc: '按顺序平均分配', icon: RefreshCw },
    { key: 'load_balance', label: '负载均衡', desc: '优先分配给负载低的人员', icon: BarChart3 },
    { key: 'industry_match', label: '行业匹配', desc: '按行业专长匹配分配', icon: Users },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">线索分配</h1>
          <p className="text-sm text-slate-500 mt-1">自动分配新线索，支持多种分配策略</p>
        </div>
        <button
          onClick={handleBatchAssign}
          disabled={newLeads.length === 0 || isAssigning}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            newLeads.length === 0 || isAssigning
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
          )}
        >
          {isAssigning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              分配中...
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4" />
              一键分配 ({newLeads.length}条)
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">新线索</p>
              <p className="text-2xl font-bold text-slate-800">{newLeads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已分配</p>
              <p className="text-2xl font-bold text-slate-800">{assignedLeads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已联系</p>
              <p className="text-2xl font-bold text-slate-800">{contactedLeads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
              <Check className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">销售成员</p>
              <p className="text-2xl font-bold text-slate-800">{activeSales.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">分配策略</h3>
            <div className="grid grid-cols-3 gap-3">
              {strategies.map((strategy) => {
                const Icon = strategy.icon;
                const isSelected = selectedStrategy === strategy.key;
                
                return (
                  <button
                    key={strategy.key}
                    onClick={() => setSelectedStrategy(strategy.key as typeof selectedStrategy)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                      isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className={cn(
                      'font-medium text-sm',
                      isSelected ? 'text-primary-700' : 'text-slate-800'
                    )}>
                      {strategy.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{strategy.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">待分配线索</h3>
              <span className="text-sm text-slate-500">共 {newLeads.length} 条</span>
            </div>
            
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {newLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">{lead.name}</h4>
                      <p className="text-sm text-slate-500">{lead.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                        {lead.source}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">评分: {lead.score}分</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{lead.industry}</span>
                      <span>{lead.phone}</span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        onChange={(e) => {
                          if (e.target.value) {
                            assignLead(lead.id, e.target.value);
                          }
                        }}
                      >
                        <option value="">分配给...</option>
                        {activeSales.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} (负载: {sp.currentLoad}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              {newLeads.length === 0 && (
                <div className="py-16 text-center">
                  <Check className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p className="text-slate-500">所有线索都已分配完毕</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">成员负载</h3>
            <div className="space-y-4">
              {activeSales.map((sp) => (
                <div key={sp.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{sp.name}</span>
                    <span className="text-sm text-slate-500">{sp.customerCount} 客户</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        sp.currentLoad > 80 ? 'bg-gradient-to-r from-danger-400 to-danger-500' :
                        sp.currentLoad > 60 ? 'bg-gradient-to-r from-warning-400 to-warning-500' :
                        'bg-gradient-to-r from-primary-400 to-accent-400'
                      )}
                      style={{ width: `${sp.currentLoad}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">负载</span>
                    <span className={cn(
                      'text-xs font-medium',
                      sp.currentLoad > 80 ? 'text-danger-500' :
                      sp.currentLoad > 60 ? 'text-warning-500' : 'text-slate-500'
                    )}>
                      {sp.currentLoad}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">最近分配</h3>
            <div className="space-y-3">
              {assignedLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {lead.assignedToName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500">分配给 {lead.assignedToName}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    getStatusColor(lead.status)
                  )}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-slate-800">分配记录中心</h3>
            <span className="text-sm text-slate-500">共 {filteredAssignments.length} 条记录</span>
          </div>
          <button
            onClick={handleExportRecords}
            className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            导出记录
          </button>
        </div>
        
        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">销售人员</label>
              <select
                value={assignmentFilters.salesPersonId || ''}
                onChange={(e) => setAssignmentFilters({ salesPersonId: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部销售</option>
                {activeSales.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">分配策略</label>
              <select
                value={assignmentFilters.strategy || ''}
                onChange={(e) => setAssignmentFilters({ strategy: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部策略</option>
                <option value="round_robin">轮询分配</option>
                <option value="load_balance">负载均衡</option>
                <option value="industry_match">行业匹配</option>
                <option value="manual">手动分配</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">关键词</label>
              <input
                type="text"
                placeholder="搜索线索名称、公司、销售姓名..."
                value={assignmentFilters.keyword || ''}
                onChange={(e) => setAssignmentFilters({ keyword: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((record) => (
              <div key={record.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {record.salesPersonName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{record.leadName}</h4>
                      <p className="text-sm text-slate-500">{record.leadCompany}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">分配给</p>
                      <p className="text-sm font-medium text-slate-700">{record.salesPersonName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">分配策略</p>
                      <span className={cn(
                        'inline-block px-2 py-0.5 text-xs rounded-full',
                        record.strategy === 'manual' 
                          ? 'bg-warning-50 text-warning-600' 
                          : 'bg-primary-50 text-primary-600'
                      )}>
                        {strategyLabels[record.strategy] || record.strategy}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">操作人</p>
                      <p className="text-sm text-slate-600">{record.assignedBy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">分配时间</p>
                      <p className="text-sm text-slate-600">{formatDate(record.assignedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无分配记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
