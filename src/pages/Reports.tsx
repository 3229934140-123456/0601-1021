import { useState, useMemo } from 'react';
import { BarChart3, Download, FileText, Calendar, TrendingUp, Users, DollarSign, Target, MapPin } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatMoney, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

type TabType = 'daily' | 'team' | 'industry' | 'region';

export default function Reports() {
  const { 
    dailyReports, 
    trendData, 
    industryStats, 
    regionStats, 
    customers, 
    opportunities,
    followUpRecords,
    salesPeople,
    teams,
    lostReasons,
    reportFilters,
    setReportFilters,
    getFilteredTrendData,
  } = useCRMStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  
  const filteredTrendData = useMemo(() => getFilteredTrendData(), [getFilteredTrendData, reportFilters, trendData, dailyReports]);
  
  const daysCount = reportFilters.dateRange === '7days' ? 7 : 
                    reportFilters.dateRange === '30days' ? 30 : 90;
  
  const filteredTeams = useMemo(() => {
    if (reportFilters.teamId) {
      return teams.filter(t => t.id === reportFilters.teamId);
    }
    return teams;
  }, [teams, reportFilters.teamId]);
  
  const filteredCustomers = useMemo(() => {
    if (reportFilters.teamId) {
      return customers.filter(c => c.teamId === reportFilters.teamId);
    }
    return customers;
  }, [customers, reportFilters.teamId]);
  
  const filteredOpportunities = useMemo(() => {
    if (reportFilters.teamId) {
      return opportunities.filter(o => {
        const cust = customers.find(c => c.id === o.customerId);
        return cust?.teamId === reportFilters.teamId;
      });
    }
    return opportunities;
  }, [opportunities, customers, reportFilters.teamId]);
  
  const filteredSalesPeople = useMemo(() => {
    if (reportFilters.teamId) {
      return salesPeople.filter(sp => sp.teamId === reportFilters.teamId);
    }
    return salesPeople;
  }, [salesPeople, reportFilters.teamId]);
  
  const computedDailyReports = useMemo(() => {
    const daysAgo = Date.now() - daysCount * 24 * 60 * 60 * 1000;
    
    return filteredTeams.map(team => {
      const teamCustomers = customers.filter(c => c.teamId === team.id);
      const teamCustomerIds = teamCustomers.map(c => c.id);
      const teamOpps = opportunities.filter(o => teamCustomerIds.includes(o.customerId));
      const wonOpps = teamOpps.filter(o => o.status === 'won');
      const activeOpps = teamOpps.filter(o => o.status === 'active');
      
      const recentOpps = teamOpps.filter(o => {
        if (!o.createdAt) return false;
        return new Date(o.createdAt).getTime() >= daysAgo;
      });
      
      const recentNewCustomers = teamCustomers.filter(c => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt).getTime() >= daysAgo;
      });
      
      const recentWonOpps = teamOpps.filter(o => {
        if (o.status !== 'won' || !o.updatedAt) return false;
        return new Date(o.updatedAt).getTime() >= daysAgo;
      });
      
      const teamFollowUps = followUpRecords.filter(f => teamCustomerIds.includes(f.customerId));
      const recentFollowUps = teamFollowUps.filter(f => {
        if (!f.date) return false;
        return new Date(f.date).getTime() >= daysAgo;
      });
      
      return {
        teamId: team.id,
        teamName: team.name,
        date: new Date().toISOString().split('T')[0],
        totalCustomers: teamCustomers.length,
        newCustomers: recentNewCustomers.length,
        totalOpportunities: teamOpps.length,
        activeOpportunities: activeOpps.length,
        wonOpportunities: wonOpps.length,
        totalAmount: teamOpps.reduce((s, o) => s + o.amount, 0),
        wonAmount: wonOpps.reduce((s, o) => s + o.amount, 0),
        followUpCount: recentFollowUps.length,
        exceptionCount: Math.round(teamOpps.length * 0.15),
        periodNewCustomers: recentNewCustomers.length,
        periodNewOpps: recentOpps.length,
        periodWonAmount: recentWonOpps.reduce((s, o) => s + o.amount, 0),
      };
    });
  }, [customers, opportunities, followUpRecords, filteredTeams, daysCount]);
  
  const totalPeriodNewCustomers = computedDailyReports.reduce((s, r) => s + r.periodNewCustomers, 0);
  const totalPeriodNewOpps = computedDailyReports.reduce((s, r) => s + r.periodNewOpps, 0);
  const totalWonAmount = filteredOpportunities.filter(o => o.status === 'won').reduce((s, o) => s + o.amount, 0);
  const totalAmount = filteredOpportunities.reduce((s, o) => s + o.amount, 0);
  const avgOutput = filteredSalesPeople.length > 0 ? totalWonAmount / filteredSalesPeople.length : 0;
  
  const tabs = [
    { key: 'daily', label: '团队日报', icon: FileText },
    { key: 'team', label: '团队对比', icon: Users },
    { key: 'industry', label: '行业分析', icon: Target },
    { key: 'region', label: '区域分析', icon: MapPin },
  ];
  
  const PIE_COLORS = ['#0c7ef7', '#06b6d4', '#f97316', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];
  
  const periodLabels = {
    '7days': '近7天',
    '30days': '近30天',
    '90days': '近90天',
  };
  
  const handleDateRangeChange = (range: '7days' | '30days' | '90days') => {
    setReportFilters({ dateRange: range });
  };
  
  const handleTeamChange = (teamId: string) => {
    setReportFilters({ teamId: teamId || undefined });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">数据报表</h1>
          <p className="text-sm text-slate-500 mt-1">多维度数据分析报表，辅助决策</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={reportFilters.teamId || ''}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          >
            <option value="">全部团队</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['7days', '30days', '90days'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  reportFilters.dateRange === range
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {periodLabels[range]}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            选择日期
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">总客户数</p>
              <p className="text-3xl font-bold mt-1">{filteredCustomers.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-primary-200 mt-3">{periodLabels[reportFilters.dateRange]}新增 {totalPeriodNewCustomers} 个</p>
        </div>
        
        <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-100">商机总额</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-accent-200 mt-3">{periodLabels[reportFilters.dateRange]}新增 {totalPeriodNewOpps} 个商机</p>
        </div>
        
        <div className="bg-gradient-to-br from-success-500 to-success-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-100">成交金额</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalWonAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-success-200 mt-3">成交率 {filteredOpportunities.length > 0 ? Math.round(filteredOpportunities.filter(o => o.status === 'won').length / filteredOpportunities.length * 100) : 0}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-warning-500 to-warning-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning-100">人均产出</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(avgOutput)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-warning-200 mt-3">{filteredSalesPeople.length} 名销售</p>
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
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">
                  {periodLabels[reportFilters.dateRange]}销售趋势
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredTrendData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickFormatter={(v) => v.slice(5)}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="newCustomers" 
                        stroke="#0c7ef7" 
                        strokeWidth={2}
                        fill="url(#colorAmount)" 
                        name="新增客户"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="followUps" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                        name="跟进次数"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">
                    {periodLabels[reportFilters.dateRange]}团队日报
                  </h3>
                  <span className="text-xs text-slate-400">
                    数据更新时间：{new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {computedDailyReports.map((report) => (
                    <div key={report.teamId} className="border border-slate-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-800">{report.teamName}</h4>
                        <span className="text-xs text-slate-400">{formatDate(report.date)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">总客户数</p>
                          <p className="text-lg font-bold text-slate-800">{report.totalCustomers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{periodLabels[reportFilters.dateRange]}新增</p>
                          <p className="text-lg font-bold text-success-600">{report.periodNewCustomers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">商机总数</p>
                          <p className="text-lg font-bold text-slate-800">{report.totalOpportunities}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">成交商机</p>
                          <p className="text-lg font-bold text-primary-600">{report.wonOpportunities}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">商机总额</p>
                          <p className="text-lg font-bold text-slate-800">{formatMoney(report.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{periodLabels[reportFilters.dateRange]}成交</p>
                          <p className="text-lg font-bold text-success-600">{formatMoney(report.periodWonAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">跟进次数</p>
                          <p className="text-lg font-bold text-slate-800">{report.followUpCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">异常数量</p>
                          <p className="text-lg font-bold text-warning-600">{report.exceptionCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">团队业绩对比</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredTeams.map(t => {
                      const teamCustomers = customers.filter(c => c.teamId === t.id);
                      const teamOpps = opportunities.filter(o => {
                        const cust = customers.find(c => c.id === o.customerId);
                        return cust?.teamId === t.id;
                      });
                      return {
                        name: t.name,
                        客户数: teamCustomers.length,
                        商机数: teamOpps.length,
                        金额: teamOpps.reduce((s, o) => s + o.amount, 0) / 10000,
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="客户数" fill="#0c7ef7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="商机数" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">团队</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">成员数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">客户数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">商机数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">商机总额</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">成交率</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">人均产出</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTeams.map((team) => {
                      const teamCustomers = customers.filter(c => c.teamId === team.id);
                      const teamOpps = opportunities.filter(o => {
                        const cust = customers.find(c => c.id === o.customerId);
                        return cust?.teamId === team.id;
                      });
                      const wonOpps = teamOpps.filter(o => o.status === 'won');
                      const wonAmount = wonOpps.reduce((s, o) => s + o.amount, 0);
                      const closeRate = teamOpps.length > 0 ? Math.round(wonOpps.length / teamOpps.length * 100) : 0;
                      
                      return (
                        <tr key={team.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{team.name}</td>
                          <td className="px-4 py-3 text-slate-600">{team.memberCount}人</td>
                          <td className="px-4 py-3 text-slate-600">{teamCustomers.length}</td>
                          <td className="px-4 py-3 text-slate-600">{teamOpps.length}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{formatMoney(teamOpps.reduce((s, o) => s + o.amount, 0))}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'px-2 py-0.5 text-xs rounded-full',
                              closeRate >= 30 ? 'bg-success-50 text-success-600' :
                              closeRate >= 15 ? 'bg-warning-50 text-warning-600' : 'bg-danger-50 text-danger-600'
                            )}>
                              {closeRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatMoney(wonAmount / team.memberCount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'industry' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">行业分布</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="customerCount"
                        nameKey="industry"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {industryStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">行业商机金额</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip formatter={(value: number) => formatMoney(value)} />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {industryStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'region' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">区域客户分布</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="customerCount" fill="#0c7ef7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">区域商机金额</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatMoney(value)} />
                      <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
