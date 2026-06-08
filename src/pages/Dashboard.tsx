import { Users, TrendingUp, Bell, AlertTriangle, Target, UserPlus, DollarSign, CalendarClock } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import StatCard from '@/components/ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/utils/format';

export default function Dashboard() {
  const {
    customers,
    opportunities,
    reminders,
    exceptions,
    leads,
    trendData,
    lostReasons,
    salesPeople,
    dailyReports,
  } = useCRMStore();
  
  const totalCustomers = customers.filter(c => !c.isExcluded).length;
  const highValueCount = customers.filter(c => c.isHighValue && !c.isExcluded).length;
  const longNoContactCount = customers.filter(c => c.daysSinceLastContact > 30 && c.status === 'active' && !c.isExcluded).length;
  const totalAmount = opportunities.filter(o => o.status === 'active').reduce((sum, o) => sum + o.amount, 0);
  const wonAmount = opportunities.filter(o => o.status === 'won').reduce((sum, o) => sum + o.amount, 0);
  const activeOpps = opportunities.filter(o => o.status === 'active').length;
  const unreadReminders = reminders.filter(r => !r.isRead).length;
  const highPriorityReminders = reminders.filter(r => r.priority === 'high' && !r.isCompleted).length;
  const unresolvedExceptions = exceptions.filter(e => !e.resolved).length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  
  const PIE_COLORS = ['#0c7ef7', '#06b6d4', '#f97316', '#22c55e', '#ef4444'];
  
  const topSalespeople = [...salesPeople]
    .filter(s => s.role === 'sales')
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);
  
  const todayReminders = reminders.filter(r => !r.isCompleted).slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">销售仪表盘</h1>
          <p className="text-sm text-slate-500 mt-1">欢迎回来，这是今日的销售数据概览</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
            导出报表
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all">
            一键扫描
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="客户总数"
          value={totalCustomers}
          icon={Users}
          color="primary"
          trend={{ value: 12, isUp: true }}
          subtitle={`高价值客户 ${highValueCount} 家`}
          delay={0}
        />
        <StatCard
          title="商机总额"
          value={formatMoney(totalAmount)}
          icon={DollarSign}
          color="success"
          trend={{ value: 8.5, isUp: true }}
          subtitle={`活跃商机 ${activeOpps} 个`}
          delay={50}
        />
        <StatCard
          title="待处理提醒"
          value={unreadReminders}
          icon={Bell}
          color="warning"
          subtitle={`高优先级 ${highPriorityReminders} 条`}
          delay={100}
        />
        <StatCard
          title="异常项"
          value={unresolvedExceptions}
          icon={AlertTriangle}
          color="danger"
          trend={{ value: 5, isUp: false }}
          subtitle={`新线索待分配 ${newLeads} 条`}
          delay={150}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">近30天趋势</h3>
              <p className="text-sm text-slate-500">客户、商机、跟进数据趋势</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-slate-600">新增客户</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-500" />
                <span className="text-slate-600">跟进次数</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-slate-600">成交金额</span>
              </div>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c7ef7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0c7ef7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFollowUps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#334155' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#0c7ef7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCustomers)" 
                  name="新增客户"
                />
                <Area 
                  type="monotone" 
                  dataKey="followUps" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorFollowUps)" 
                  name="跟进次数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">丢单原因分布</h3>
          <p className="text-sm text-slate-500 mb-4">分析各原因占比，制定改进策略</p>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lostReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
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
            {lostReasons.slice(0, 4).map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  <span className="text-slate-600">{item.reason}</span>
                </div>
                <span className="text-slate-500 font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">今日待办</h3>
              <p className="text-sm text-slate-500">需要处理的提醒事项</p>
            </div>
            <Link 
              to="/reminders" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {todayReminders.map((reminder, index) => (
              <div 
                key={reminder.id}
                className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  reminder.priority === 'high' ? 'bg-danger-50 text-danger-500' :
                  reminder.priority === 'medium' ? 'bg-warning-50 text-warning-500' :
                  'bg-slate-100 text-slate-500'
                )}>
                  {reminder.type === 'visit' && <Target className="w-5 h-5" />}
                  {reminder.type === 'follow_up' && <CalendarClock className="w-5 h-5" />}
                  {reminder.type === 'deadline' && <AlertTriangle className="w-5 h-5" />}
                  {reminder.type === 'contact' && <Users className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800 text-sm truncate">{reminder.title}</h4>
                    {reminder.priority === 'high' && (
                      <span className="px-1.5 py-0.5 text-xs bg-danger-100 text-danger-600 rounded font-medium flex-shrink-0">
                        高优先
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{reminder.content}</p>
                  <p className="text-xs text-slate-400 mt-1">负责人：{reminder.salesPersonName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: '350ms', animationFillMode: 'backwards' }}>
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">销售排行</h3>
            <p className="text-sm text-slate-500">按业绩排名</p>
          </div>
          
          <div className="p-4 space-y-3">
            {topSalespeople.map((sp, index) => (
              <div key={sp.id} className="flex items-center gap-3">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                  'bg-slate-100 text-slate-500'
                )}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 truncate">{sp.name}</span>
                    <span className="text-sm font-semibold text-primary-600 ml-2">
                      {formatMoney(sp.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all duration-500"
                        style={{ width: `${(sp.totalAmount / topSalespeople[0].totalAmount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {sp.customerCount}客户
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/customer-scan" className="block">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:-translate-y-0.5">
            <Users className="w-8 h-8 mb-3 opacity-90" />
            <h4 className="font-semibold">客户扫描</h4>
            <p className="text-sm text-primary-100 mt-1">扫描 {totalCustomers} 个客户</p>
          </div>
        </Link>
        
        <Link to="/opportunity-score" className="block">
          <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-accent-500/30 transition-all hover:-translate-y-0.5">
            <TrendingUp className="w-8 h-8 mb-3 opacity-90" />
            <h4 className="font-semibold">商机评分</h4>
            <p className="text-sm text-accent-100 mt-1">{activeOpps} 个活跃商机</p>
          </div>
        </Link>
        
        <Link to="/lead-assignment" className="block">
          <div className="bg-gradient-to-br from-success-500 to-success-700 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-success-500/30 transition-all hover:-translate-y-0.5">
            <UserPlus className="w-8 h-8 mb-3 opacity-90" />
            <h4 className="font-semibold">线索分配</h4>
            <p className="text-sm text-success-100 mt-1">{newLeads} 条待分配</p>
          </div>
        </Link>
        
        <Link to="/reports" className="block">
          <div className="bg-gradient-to-br from-warning-500 to-warning-700 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-warning-500/30 transition-all hover:-translate-y-0.5">
            <Target className="w-8 h-8 mb-3 opacity-90" />
            <h4 className="font-semibold">数据报表</h4>
            <p className="text-sm text-warning-100 mt-1">{dailyReports.length} 份日报</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
