import { useState } from 'react';
import { TrendingUp, Filter, Star, Flame, Target, ChevronUp, ChevronDown } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatMoney, formatDate, getHeatScoreBg, getHeatScoreColor } from '@/utils/format';
import { cn } from '@/lib/utils';

type SortField = 'heatScore' | 'amount' | 'probability' | 'daysInCurrentStage';
type SortOrder = 'asc' | 'desc';

export default function OpportunityScore() {
  const { opportunities, customers } = useCRMStore();
  const [sortField, setSortField] = useState<SortField>('heatScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  const activeOpps = opportunities.filter(o => o.status === 'active');
  const wonOpps = opportunities.filter(o => o.status === 'won');
  
  const levels = ['all', 'A', 'B', 'C', 'D'];
  const stages = ['all', ...new Set(activeOpps.map(o => o.stage))];
  
  const getLevelFromScore = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  };
  
  const filteredOpps = activeOpps.filter(opp => {
    if (selectedLevel !== 'all' && getLevelFromScore(opp.heatScore) !== selectedLevel) return false;
    if (selectedStage !== 'all' && opp.stage !== selectedStage) return false;
    return true;
  });
  
  const sortedOpps = [...filteredOpps].sort((a, b) => {
    let valA: number;
    let valB: number;
    
    switch (sortField) {
      case 'heatScore':
        valA = a.heatScore;
        valB = b.heatScore;
        break;
      case 'amount':
        valA = a.amount;
        valB = b.amount;
        break;
      case 'probability':
        valA = a.probability;
        valB = b.probability;
        break;
      case 'daysInCurrentStage':
        valA = a.daysInCurrentStage;
        valB = b.daysInCurrentStage;
        break;
      default:
        valA = a.heatScore;
        valB = b.heatScore;
    }
    
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex ml-1">
      {sortField === field ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="w-3.5 h-3.5 text-primary-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-primary-500" />
        )
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
      )}
    </span>
  );
  
  const avgHeatScore = activeOpps.length > 0
    ? Math.round(activeOpps.reduce((sum, o) => sum + o.heatScore, 0) / activeOpps.length)
    : 0;
  
  const totalAmount = activeOpps.reduce((sum, o) => sum + o.amount, 0);
  const weightedAmount = activeOpps.reduce((sum, o) => sum + o.amount * o.probability / 100, 0);
  
  const levelStats = {
    A: activeOpps.filter(o => o.heatScore >= 80).length,
    B: activeOpps.filter(o => o.heatScore >= 60 && o.heatScore < 80).length,
    C: activeOpps.filter(o => o.heatScore >= 40 && o.heatScore < 60).length,
    D: activeOpps.filter(o => o.heatScore < 40).length,
  };
  
  const topOpps = [...activeOpps].sort((a, b) => b.heatScore - a.heatScore).slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">商机评分</h1>
          <p className="text-sm text-slate-500 mt-1">智能评估商机热度，优先跟进高价值商机</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            评分规则
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            重新评分
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">活跃商机</p>
              <p className="text-3xl font-bold mt-1">{activeOpps.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-primary-200 mt-3">较上周 +12%</p>
        </div>
        
        <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-100">商机总额</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-accent-200 mt-3">加权预计：{formatMoney(weightedAmount)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-warning-500 to-warning-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning-100">平均热度</p>
              <p className="text-3xl font-bold mt-1">{avgHeatScore}分</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-warning-200 mt-3">A级商机 {levelStats.A} 个</p>
        </div>
        
        <div className="bg-gradient-to-br from-success-500 to-success-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-100">已成交</p>
              <p className="text-3xl font-bold mt-1">{wonOpps.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-success-200 mt-3">成交金额：{formatMoney(wonOpps.reduce((s, o) => s + o.amount, 0))}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">商机等级分布</h3>
              <span className="text-sm text-slate-500">共 {activeOpps.length} 个商机</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((level) => {
                const count = levelStats[level];
                const percentage = activeOpps.length > 0 ? Math.round(count / activeOpps.length * 100) : 0;
                
                return (
                  <div
                    key={level}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selectedLevel === level
                        ? level === 'A' ? 'border-danger-400 bg-danger-50' :
                          level === 'B' ? 'border-warning-400 bg-warning-50' :
                          level === 'C' ? 'border-primary-400 bg-primary-50' :
                          'border-slate-300 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200'
                    )}
                    onClick={() => setSelectedLevel(selectedLevel === level ? 'all' : level)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white',
                        level === 'A' ? 'bg-gradient-to-br from-danger-400 to-danger-600' :
                        level === 'B' ? 'bg-gradient-to-br from-warning-400 to-warning-600' :
                        level === 'C' ? 'bg-gradient-to-br from-primary-400 to-primary-600' :
                        'bg-gradient-to-br from-slate-400 to-slate-500'
                      )}>
                        {level}
                      </span>
                      <span className="text-2xl font-bold text-slate-800">{count}</span>
                    </div>
                    <p className="text-xs text-slate-500">占比 {percentage}%</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">商机列表</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="all">全部阶段</option>
                  {stages.filter(s => s !== 'all').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('heatScore')}
                    >
                      <span className="flex items-center">
                        热度评分
                        <SortIcon field="heatScore" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">商机名称</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('amount')}
                    >
                      <span className="flex items-center">
                        金额
                        <SortIcon field="amount" />
                      </span>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('probability')}
                    >
                      <span className="flex items-center">
                        概率
                        <SortIcon field="probability" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">阶段</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('daysInCurrentStage')}
                    >
                      <span className="flex items-center">
                        停留天数
                        <SortIcon field="daysInCurrentStage" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">负责人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedOpps.map((opp, index) => {
                    const level = getLevelFromScore(opp.heatScore);
                    
                    return (
                      <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br',
                              getHeatScoreBg(opp.heatScore)
                            )}>
                              {opp.heatScore}
                            </div>
                            <span className={cn('text-sm font-medium', getHeatScoreColor(opp.heatScore))}>
                              {level}级
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 text-sm">{opp.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{opp.customerName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-slate-800">
                            ¥{opp.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 w-10">{opp.probability}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                            {opp.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-sm',
                            opp.daysInCurrentStage > 60 ? 'text-danger-600 font-medium' :
                            opp.daysInCurrentStage > 30 ? 'text-warning-600' : 'text-slate-600'
                          )}>
                            {opp.daysInCurrentStage} 天
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{opp.salesPersonName}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {sortedOpps.length === 0 && (
              <div className="py-16 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无符合条件的商机</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">热度TOP5</h3>
            <div className="space-y-3">
              {topOpps.map((opp, index) => (
                <div key={opp.id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                    index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-primary-400 to-primary-500'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{opp.name}</p>
                    <p className="text-xs text-slate-500">{formatMoney(opp.amount)}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-bold',
                    getHeatScoreColor(opp.heatScore)
                  )}>
                    {opp.heatScore}分
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">评分维度说明</h3>
            <div className="space-y-3">
              {[
                { label: '客户级别', weight: 25, desc: 'A/B/C/D级客户权重' },
                { label: '商机金额', weight: 20, desc: '金额越大权重越高' },
                { label: '阶段进度', weight: 20, desc: '阶段越靠后评分越高' },
                { label: '跟进频率', weight: 20, desc: '近期跟进越频繁越好' },
                { label: '竞争情况', weight: 15, desc: '竞争越少优势越大' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="text-primary-600 font-semibold">{item.weight}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
                      style={{ width: `${item.weight * 4}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
