import { useState } from 'react';
import { AlertTriangle, XCircle, Clock, Copy, CheckCircle, FileWarning, TrendingDown } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TabType = 'all' | 'lost' | 'long_stage' | 'no_contact' | 'duplicate';

export default function ExceptionSummary() {
  const { exceptions, lostReasons, resolveException } = useCRMStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const tabs: { key: TabType; label: string; icon: typeof AlertTriangle; count: number }[] = [
    { key: 'all', label: '全部异常', icon: AlertTriangle, count: exceptions.filter(e => !e.resolved).length },
    { key: 'lost', label: '丢单分析', icon: XCircle, count: exceptions.filter(e => e.type === 'lost_reason' && !e.resolved).length },
    { key: 'long_stage', label: '阶段超时', icon: Clock, count: exceptions.filter(e => e.type === 'long_stage' && !e.resolved).length },
    { key: 'no_contact', label: '长期未联系', icon: TrendingDown, count: exceptions.filter(e => e.type === 'no_contact' && !e.resolved).length },
    { key: 'duplicate', label: '重复客户', icon: Copy, count: exceptions.filter(e => e.type === 'duplicate' && !e.resolved).length },
  ];
  
  const PIE_COLORS = ['#ef4444', '#f97316', '#0c7ef7', '#06b6d4', '#22c55e'];
  
  const filteredExceptions = exceptions.filter(e => {
    if (activeTab === 'all') return !e.resolved;
    if (activeTab === 'lost') return e.type === 'lost_reason' && !e.resolved;
    if (activeTab === 'long_stage') return e.type === 'long_stage' && !e.resolved;
    if (activeTab === 'no_contact') return e.type === 'no_contact' && !e.resolved;
    if (activeTab === 'duplicate') return e.type === 'duplicate' && !e.resolved;
    return true;
  });
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lost_reason': return <XCircle className="w-5 h-5" />;
      case 'long_stage': return <Clock className="w-5 h-5" />;
      case 'no_contact': return <TrendingDown className="w-5 h-5" />;
      case 'duplicate': return <Copy className="w-5 h-5" />;
      case 'incomplete': return <FileWarning className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lost_reason': return '丢单';
      case 'long_stage': return '阶段超时';
      case 'no_contact': return '未联系';
      case 'duplicate': return '重复客户';
      case 'incomplete': return '信息不全';
      default: return '异常';
    }
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-danger-50 text-danger-500';
      case 'medium': return 'bg-warning-50 text-warning-500';
      case 'low': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };
  
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '低风险';
    }
  };
  
  const unresolvedCount = exceptions.filter(e => !e.resolved).length;
  const highRiskCount = exceptions.filter(e => e.level === 'high' && !e.resolved).length;
  const resolvedCount = exceptions.filter(e => e.resolved).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">异常汇总</h1>
          <p className="text-sm text-slate-500 mt-1">发现和跟踪销售过程中的异常情况</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2">
          导出异常报告
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待处理异常</p>
              <p className="text-2xl font-bold text-slate-800">{unresolvedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-danger-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">高风险项</p>
              <p className="text-2xl font-bold text-danger-600">{highRiskCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已处理</p>
              <p className="text-2xl font-bold text-success-600">{resolvedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileWarning className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">异常类型</p>
              <p className="text-2xl font-bold text-primary-600">5</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">丢单原因分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lostReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="reason"
                >
                  {lostReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {lostReasons.map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  <span className="text-slate-600">{item.reason}</span>
                </div>
                <span className="text-slate-500 font-medium">{item.count}笔</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">丢单金额统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lostReasons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="reason" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value / 10000).toFixed(1)}万`, '金额']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {lostReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap',
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="divide-y divide-slate-50">
          {filteredExceptions.map((ex) => (
            <div key={ex.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  getLevelColor(ex.level)
                )}>
                  {getTypeIcon(ex.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-800">{ex.title}</h4>
                        <span className={cn(
                          'px-2 py-0.5 text-xs rounded-full',
                          getLevelColor(ex.level)
                        )}>
                          {getLevelLabel(ex.level)}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {getTypeLabel(ex.type)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{ex.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
                      {formatDate(ex.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {ex.customerName && <span>客户：{ex.customerName}</span>}
                      {ex.salesPersonName && <span>负责人：{ex.salesPersonName}</span>}
                    </div>
                    
                    <button
                      onClick={() => resolveException(ex.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      标记已处理 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredExceptions.length === 0 && (
            <div className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-success-300 mx-auto mb-4" />
              <p className="text-slate-500">没有异常项，继续保持！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
