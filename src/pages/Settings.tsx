import { useState } from 'react';
import { Settings, Users, Ban, Sliders, UserPlus, X, Plus } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

type TabType = 'teams' | 'exclusions' | 'scoring' | 'reminders';

export default function SettingsPage() {
  const { teams, salesPeople, exclusions, customers, removeExclusion, excludeCustomer } = useCRMStore();
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [showAddExclusion, setShowAddExclusion] = useState(false);
  const [exclusionCustomerId, setExclusionCustomerId] = useState('');
  const [exclusionReason, setExclusionReason] = useState('');
  
  const tabs = [
    { key: 'teams', label: '团队管理', icon: Users },
    { key: 'exclusions', label: '排除名单', icon: Ban },
    { key: 'scoring', label: '评分规则', icon: Sliders },
    { key: 'reminders', label: '提醒设置', icon: Bell },
  ];
  
  const nonExcludedCustomers = customers.filter(c => !c.isExcluded);
  
  const handleAddExclusion = () => {
    if (exclusionCustomerId && exclusionReason) {
      excludeCustomer(exclusionCustomerId, exclusionReason);
      setShowAddExclusion(false);
      setExclusionCustomerId('');
      setExclusionReason('');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">系统设置</h1>
          <p className="text-sm text-slate-500 mt-1">管理团队、排除名单、评分规则等系统配置</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={cn(
                    'px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors',
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">团队列表</h3>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  新建团队
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="border border-slate-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{team.name}</h4>
                          <p className="text-xs text-slate-500">主管：{team.managerName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4">{team.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{team.memberCount}</p>
                        <p className="text-xs text-slate-500">成员</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{team.customerCount}</p>
                        <p className="text-xs text-slate-500">客户</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary-600">{(team.totalAmount / 10000).toFixed(0)}万</p>
                        <p className="text-xs text-slate-500">业绩</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4">销售人员</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">姓名</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">邮箱</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">角色</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">团队</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">客户数</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">商机数</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {salesPeople.map((sp) => (
                        <tr key={sp.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                                {sp.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{sp.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{sp.email}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'px-2 py-0.5 text-xs rounded-full',
                              sp.role === 'manager' ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-600'
                            )}>
                              {sp.role === 'manager' ? '主管' : '销售'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{sp.teamName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{sp.customerCount}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{sp.opportunityCount}</td>
                          <td className="px-4 py-3">
                            <button className="text-sm text-primary-600 hover:text-primary-700">编辑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'exclusions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">排除名单</h3>
                  <p className="text-sm text-slate-500 mt-1">被排除的客户不会出现在扫描结果和统计数据中</p>
                </div>
                <button 
                  onClick={() => setShowAddExclusion(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加排除
                </button>
              </div>
              
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {exclusions.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {exclusions.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
                            <Ban className="w-5 h-5 text-danger-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{item.customerName}</h4>
                            <p className="text-sm text-slate-500">原因：{item.reason}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">排除时间</p>
                            <p className="text-sm text-slate-600">{formatDate(item.excludedAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">操作人</p>
                            <p className="text-sm text-slate-600">{item.excludedBy}</p>
                          </div>
                          <button
                            onClick={() => removeExclusion(item.customerId)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            恢复
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Ban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">暂无排除的客户</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800">商机评分规则</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-xl p-5">
                  <h4 className="font-medium text-slate-800 mb-4">评分维度设置</h4>
                  
                  <div className="space-y-4">
                    {[
                      { label: '客户级别权重', value: 25, desc: 'A/B/C/D级客户的权重' },
                      { label: '商机金额权重', value: 20, desc: '金额越大权重越高' },
                      { label: '阶段进度权重', value: 20, desc: '阶段越靠后评分越高' },
                      { label: '跟进频率权重', value: 20, desc: '近期跟进越频繁越好' },
                      { label: '竞争情况权重', value: 15, desc: '竞争越少优势越大' },
                    ].map((item, index) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          <span className="text-sm font-semibold text-primary-600">{item.value}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={item.value}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border border-slate-100 rounded-xl p-5">
                  <h4 className="font-medium text-slate-800 mb-4">等级划分标准</h4>
                  
                  <div className="space-y-3">
                    {[
                      { level: 'A', range: '80-100分', desc: '高价值商机，重点跟进', color: 'danger' },
                      { level: 'B', range: '60-79分', desc: '较高价值，优先跟进', color: 'warning' },
                      { level: 'C', range: '40-59分', desc: '一般价值，常规跟进', color: 'primary' },
                      { level: 'D', range: '0-39分', desc: '低价值，维护跟进', color: 'slate' },
                    ].map((item) => (
                      <div key={item.level} className={cn(
                        'p-3 rounded-lg border',
                        item.color === 'danger' ? 'bg-danger-50 border-danger-200' :
                        item.color === 'warning' ? 'bg-warning-50 border-warning-200' :
                        item.color === 'primary' ? 'bg-primary-50 border-primary-200' :
                        'bg-slate-50 border-slate-200'
                      )}>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            'text-lg font-bold',
                            item.color === 'danger' ? 'text-danger-600' :
                            item.color === 'warning' ? 'text-warning-600' :
                            item.color === 'primary' ? 'text-primary-600' :
                            'text-slate-600'
                          )}>
                            {item.level}级
                          </span>
                          <span className="text-sm text-slate-600">{item.range}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  保存设置
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800">提醒设置</h3>
              
              <div className="space-y-4">
                {[
                  { title: '长期未联系提醒', desc: '客户超过指定天数未跟进时发送提醒', days: 30, enabled: true },
                  { title: '商机阶段停留提醒', desc: '商机在某阶段停留超过指定天时发送提醒', days: 15, enabled: true },
                  { title: '高价值客户拜访提醒', desc: '高价值客户超过7天未联系时提醒拜访', days: 7, enabled: true },
                  { title: '联系人信息缺失提醒', desc: '客户缺少关键联系人信息时提醒补充', days: 0, enabled: true },
                  { title: '重复客户检测提醒', desc: '检测到疑似重复客户时发送提醒', days: 0, enabled: false },
                ].map((item, index) => (
                  <div key={item.title} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {item.days > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">阈值:</span>
                          <select className="px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                            <option>{item.days}天</option>
                            <option>{item.days + 7}天</option>
                            <option>{item.days + 15}天</option>
                          </select>
                        </div>
                      )}
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-medium text-slate-800 mb-4">提醒方式</h4>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                    <span className="text-sm text-slate-700">系统通知</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                    <span className="text-sm text-slate-700">邮件提醒</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                    <span className="text-sm text-slate-700">短信提醒</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  保存设置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showAddExclusion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">添加排除名单</h3>
              <button
                onClick={() => setShowAddExclusion(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-1.5 block">选择客户</label>
                <select
                  value={exclusionCustomerId}
                  onChange={(e) => setExclusionCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                >
                  <option value="">请选择要排除的客户</option>
                  {nonExcludedCustomers.slice(0, 20).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-600 mb-1.5 block">排除原因</label>
                <textarea
                  value={exclusionReason}
                  onChange={(e) => setExclusionReason(e.target.value)}
                  placeholder="请输入排除原因..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddExclusion(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddExclusion}
                className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 transition-colors"
              >
                确认排除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bell(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
