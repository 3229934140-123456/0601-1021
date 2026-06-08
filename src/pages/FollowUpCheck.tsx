import { useState } from 'react';
import { ClipboardCheck, CheckCircle, AlertCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate, getFollowUpTypeColor, getFollowUpTypeLabel, getStatusColor, getStatusLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function FollowUpCheck() {
  const { followUpRecords, customers, opportunities, teams } = useCRMStore();
  const [activeTab, setActiveTab] = useState<'records' | 'incomplete' | 'contacts' | 'stages'>('records');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  
  const salesPeople = useCRMStore(state => state.salesPeople);
  
  const incompleteRecords = followUpRecords.filter(r => !r.isComplete);
  const completeRecords = followUpRecords.filter(r => r.isComplete);
  
  const incompleteCustomers = customers.filter(c => 
    !c.contactPerson || !c.phone || !c.email
  );
  
  const longStageOpps = opportunities.filter(o => 
    o.status === 'active' && o.daysInCurrentStage > 30
  );
  
  const completenessRate = followUpRecords.length > 0
    ? Math.round((completeRecords.length / followUpRecords.length) * 100)
    : 0;
  
  const tabs = [
    { key: 'records', label: '跟进记录', icon: FileText, count: followUpRecords.length },
    { key: 'incomplete', label: '不完整记录', icon: AlertCircle, count: incompleteRecords.length },
    { key: 'contacts', label: '联系人缺失', icon: User, count: incompleteCustomers.length },
    { key: 'stages', label: '阶段停留', icon: Clock, count: longStageOpps.length },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">跟进检查</h1>
          <p className="text-sm text-slate-500 mt-1">检查跟进记录质量，补全客户信息，推动商机进展</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            <option value="">全部团队</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={selectedSalesPerson}
            onChange={(e) => setSelectedSalesPerson(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            <option value="">全部人员</option>
            {salesPeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">跟进记录总数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{followUpRecords.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">完整率</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{completenessRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success-400 to-success-600 rounded-full transition-all duration-500"
              style={{ width: `${completenessRate}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">不完整记录</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{incompleteRecords.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">阶段超时商机</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">{longStageOpps.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-danger-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    'px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors relative',
                    isActive
                      ? 'text-primary-600 border-primary-500'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-0">
          {activeTab === 'records' && (
            <div className="divide-y divide-slate-50">
              {followUpRecords.slice(0, 20).map((record, index) => (
                <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      getFollowUpTypeColor(record.type)
                    )}>
                      {record.type === 'call' && <span className="text-xs font-bold">电话</span>}
                      {record.type === 'meeting' && <span className="text-xs font-bold">会议</span>}
                      {record.type === 'email' && <span className="text-xs font-bold">邮件</span>}
                      {record.type === 'visit' && <span className="text-xs font-bold">拜访</span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-slate-800">{record.customerName}</h4>
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            getFollowUpTypeColor(record.type)
                          )}>
                            {getFollowUpTypeLabel(record.type)}
                          </span>
                          {record.isComplete ? (
                            <span className="flex items-center gap-1 text-xs text-success-600">
                              <CheckCircle className="w-3.5 h-3.5" /> 完整
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-warning-600">
                              <AlertCircle className="w-3.5 h-3.5" /> 不完整
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-400">{formatDate(record.date)}</span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {record.content || <span className="text-slate-400 italic">未填写跟进内容</span>}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>负责人：{record.salesPersonName}</span>
                        {record.result && <span>结果：{record.result}</span>}
                        {record.nextPlan && <span>下一步：{record.nextPlan}</span>}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              record.completenessScore >= 80 ? 'bg-success-500' :
                              record.completenessScore >= 50 ? 'bg-warning-500' : 'bg-danger-500'
                            )}
                            style={{ width: `${record.completenessScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-12 text-right">
                          {record.completenessScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'incomplete' && (
            <div className="divide-y divide-slate-50">
              {incompleteRecords.map((record) => (
                <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-warning-500" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-800">{record.customerName}</h4>
                        <span className="text-sm text-slate-400">{formatDate(record.date)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!record.content && (
                          <span className="px-2 py-0.5 bg-danger-50 text-danger-600 text-xs rounded">
                            缺少跟进内容
                          </span>
                        )}
                        {!record.result && (
                          <span className="px-2 py-0.5 bg-warning-50 text-warning-600 text-xs rounded">
                            缺少跟进结果
                          </span>
                        )}
                        {!record.nextPlan && (
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded">
                            缺少下一步计划
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-slate-500">负责人：{record.salesPersonName}</span>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          补充信息 →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {incompleteRecords.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p className="text-slate-500">所有跟进记录都很完整，做得好！</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'contacts' && (
            <div className="divide-y divide-slate-50">
              {incompleteCustomers.map((customer) => (
                <div key={customer.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-danger-500" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{customer.name}</h4>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!customer.contactPerson && (
                          <span className="px-2 py-0.5 bg-danger-50 text-danger-600 text-xs rounded">
                            缺少联系人姓名
                          </span>
                        )}
                        {!customer.phone && (
                          <span className="px-2 py-0.5 bg-warning-50 text-warning-600 text-xs rounded">
                            缺少联系电话
                          </span>
                        )}
                        {!customer.email && (
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded">
                            缺少电子邮箱
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-slate-500">负责人：{customer.salesPersonName}</span>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          补充联系人 →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {incompleteCustomers.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p className="text-slate-500">所有客户联系人信息都很完整</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'stages' && (
            <div className="divide-y divide-slate-50">
              {longStageOpps.map((opp) => (
                <div key={opp.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      opp.daysInCurrentStage > 60 ? 'bg-danger-50 text-danger-500' : 'bg-warning-50 text-warning-500'
                    )}>
                      <Clock className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-800">{opp.name}</h4>
                        <span className={cn(
                          'px-2 py-0.5 text-xs rounded-full',
                          opp.daysInCurrentStage > 60 ? 'bg-danger-100 text-danger-600' : 'bg-warning-100 text-warning-600'
                        )}>
                          已停留 {opp.daysInCurrentStage} 天
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>客户：{opp.customerName}</span>
                        <span>当前阶段：{opp.stage}</span>
                        <span>金额：{opp.amount.toLocaleString()}元</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-slate-500">负责人：{opp.salesPersonName}</span>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          推动进展 →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {longStageOpps.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle className="w-12 h-12 text-success-300 mx-auto mb-4" />
                  <p className="text-slate-500">没有停留时间过长的商机，继续保持！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
