import { useState, useMemo } from 'react';
import { Search, Filter, Users, AlertCircle, Copy, Star, ChevronDown, RefreshCw, Download, X } from 'lucide-react';
import { useCRMStore } from '@/store/useCRMStore';
import { formatDate, getLevelColor, getStatusColor, getStatusLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function CustomerScan() {
  const {
    customers,
    customerFilters,
    setCustomerFilters,
    teams,
    getFilteredCustomers,
    excludeCustomer,
    batchExcludeCustomers,
    batchMarkHighValue,
  } = useCRMStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [excludeModal, setExcludeModal] = useState<{ open: boolean; customerId?: string; isBatch?: boolean }>({ open: false });
  const [excludeReason, setExcludeReason] = useState('');
  
  const filteredCustomers = useMemo(
    () => getFilteredCustomers(), 
    [getFilteredCustomers, customerFilters, customers]
  );
  
  const longNoContactCustomers = useMemo(
    () => filteredCustomers.filter(c => c.daysSinceLastContact > 30 && c.status === 'active'),
    [filteredCustomers]
  );
  
  const duplicateCustomers = useMemo(
    () => filteredCustomers.filter(c => c.isDuplicate),
    [filteredCustomers]
  );
  
  const highValueCustomers = useMemo(
    () => filteredCustomers.filter(c => c.isHighValue),
    [filteredCustomers]
  );
  
  const industries = [...new Set(customers.map(c => c.industry))];
  const regions = [...new Set(customers.map(c => c.region))];
  const levels = ['A', 'B', 'C', 'D'];
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };
  
  const handleSelectCustomer = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, id]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(sid => sid !== id));
    }
  };
  
  const handleExclude = () => {
    if (excludeModal.isBatch && excludeReason) {
      batchExcludeCustomers(selectedCustomers, excludeReason);
      setSelectedCustomers([]);
      setExcludeModal({ open: false });
      setExcludeReason('');
    } else if (excludeModal.customerId && excludeReason) {
      excludeCustomer(excludeModal.customerId, excludeReason);
      setExcludeModal({ open: false });
      setExcludeReason('');
    }
  };
  
  const handleBatchHighValue = () => {
    const hasHighValue = selectedCustomers.some(id => {
      const c = customers.find(cust => cust.id === id);
      return c?.isHighValue;
    });
    const allHighValue = hasHighValue ? false : true;
    batchMarkHighValue(selectedCustomers, allHighValue);
  };
  
  const handleBatchExclude = () => {
    setExcludeModal({ open: true, isBatch: true });
  };
  
  const clearFilters = () => {
    setCustomerFilters({
      teamId: undefined,
      industry: undefined,
      region: undefined,
      level: undefined,
      status: undefined,
      keyword: undefined,
      onlyLongNoContact: false,
      onlyHighValue: false,
      onlyDuplicate: false,
      excludeExcluded: true,
    });
    setSelectedCustomers([]);
  };
  
  const activeFilterCount = [
    customerFilters.teamId,
    customerFilters.industry,
    customerFilters.region,
    customerFilters.level,
    customerFilters.status,
    customerFilters.keyword,
    customerFilters.onlyLongNoContact,
    customerFilters.onlyHighValue,
    customerFilters.onlyDuplicate,
  ].filter(Boolean).length;
  
  const selectedAllHighValue = useMemo(() => {
    if (selectedCustomers.length === 0) return false;
    return selectedCustomers.every(id => {
      const c = customers.find(cust => cust.id === id);
      return c?.isHighValue;
    });
  }, [selectedCustomers, customers]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">客户扫描</h1>
          <p className="text-sm text-slate-500 mt-1">扫描客户数据，识别异常，标记高价值客户</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            筛选
            {activeFilterCount > 0 && (
              <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            一键扫描
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{filteredCustomers.length}</div>
              <div className="text-xs text-slate-500">客户总数</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{longNoContactCustomers.length}</div>
              <div className="text-xs text-slate-500">30天未联系</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <Copy className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{duplicateCustomers.length}</div>
              <div className="text-xs text-slate-500">疑似重复</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{highValueCustomers.length}</div>
              <div className="text-xs text-slate-500">高价值客户</div>
            </div>
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">筛选条件</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              清除全部
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">团队</label>
              <select
                value={customerFilters.teamId || ''}
                onChange={(e) => setCustomerFilters({ teamId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部团队</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">行业</label>
              <select
                value={customerFilters.industry || ''}
                onChange={(e) => setCustomerFilters({ industry: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部行业</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">区域</label>
              <select
                value={customerFilters.region || ''}
                onChange={(e) => setCustomerFilters({ region: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部区域</option>
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">客户级别</label>
              <select
                value={customerFilters.level || ''}
                onChange={(e) => setCustomerFilters({ level: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部级别</option>
                {levels.map(lv => (
                  <option key={lv} value={lv}>{lv}级</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">客户状态</label>
              <select
                value={customerFilters.status || ''}
                onChange={(e) => setCustomerFilters({ status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              >
                <option value="">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">不活跃</option>
                <option value="lost">已流失</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">关键词</label>
              <input
                type="text"
                placeholder="搜索客户名称..."
                value={customerFilters.keyword || ''}
                onChange={(e) => setCustomerFilters({ keyword: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-600">快捷筛选：</span>
            <button
              onClick={() => setCustomerFilters({ onlyLongNoContact: !customerFilters.onlyLongNoContact })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                customerFilters.onlyLongNoContact
                  ? 'bg-warning-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              长期未联系
            </button>
            <button
              onClick={() => setCustomerFilters({ onlyHighValue: !customerFilters.onlyHighValue })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                customerFilters.onlyHighValue
                  ? 'bg-success-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              高价值客户
            </button>
            <button
              onClick={() => setCustomerFilters({ onlyDuplicate: !customerFilters.onlyDuplicate })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                customerFilters.onlyDuplicate
                  ? 'bg-danger-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              疑似重复
            </button>
          </div>
        </div>
      )}
      
      {selectedCustomers.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between animate-slide-down">
          <span className="text-sm text-primary-700">
            已选择 <span className="font-semibold">{selectedCustomers.length}</span> 个客户
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBatchHighValue}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                selectedAllHighValue
                  ? 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
                  : 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
              )}
            >
              <Star className="w-4 h-4" />
              {selectedAllHighValue ? '取消高价值' : '批量标记高价值'}
            </button>
            <button 
              onClick={handleBatchExclude}
              className="px-3 py-1.5 bg-white border border-danger-200 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-50 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              批量排除
            </button>
            <button 
              onClick={() => setSelectedCustomers([])}
              className="text-primary-500 hover:text-primary-700 ml-2"
            >
              取消选择
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户名称</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">级别</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">行业/区域</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">联系人</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">负责人</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">上次联系</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">标签</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer, index) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-slate-50 transition-colors"
                  style={{ animationDelay: `${index * 10}ms` }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                      className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 text-sm">{customer.name}</div>
                    <div className="text-xs text-slate-400">{customer.companySize}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-bold border',
                      getLevelColor(customer.level)
                    )}>
                      {customer.level}级
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">{customer.industry}</div>
                    <div className="text-xs text-slate-400">{customer.region}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">{customer.contactPerson}</div>
                    <div className="text-xs text-slate-400">{customer.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{customer.salesPersonName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">{formatDate(customer.lastContactDate)}</div>
                    <div className={cn(
                      'text-xs',
                      customer.daysSinceLastContact > 30 ? 'text-danger-500' :
                      customer.daysSinceLastContact > 15 ? 'text-warning-500' : 'text-slate-400'
                    )}>
                      {customer.daysSinceLastContact}天前
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      getStatusColor(customer.status)
                    )}>
                      {getStatusLabel(customer.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {customer.isHighValue && (
                        <span className="px-1.5 py-0.5 bg-success-50 text-success-600 rounded text-xs font-medium">
                          高价值
                        </span>
                      )}
                      {customer.isDuplicate && (
                        <span className="px-1.5 py-0.5 bg-danger-50 text-danger-600 rounded text-xs font-medium">
                          重复
                        </span>
                      )}
                      {customer.daysSinceLastContact > 30 && customer.status === 'active' && (
                        <span className="px-1.5 py-0.5 bg-warning-50 text-warning-600 rounded text-xs font-medium">
                          久未联系
                        </span>
                      )}
                      {customer.isExcluded && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                          已排除
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                        查看
                      </button>
                      {!customer.isExcluded ? (
                        <button
                          onClick={() => setExcludeModal({ open: true, customerId: customer.id })}
                          className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors"
                        >
                          排除
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无符合条件的客户</p>
            <button
              onClick={clearFilters}
              className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              清除筛选条件
            </button>
          </div>
        )}
        
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-sm text-slate-500">
            共 {filteredCustomers.length} 条记录
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors">
              上一页
            </button>
            <span className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium">1</span>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors">
              下一页
            </button>
          </div>
        </div>
      </div>
      
      {excludeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {excludeModal.isBatch ? '批量排除客户' : '排除客户'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {excludeModal.isBatch 
                ? `将排除 ${selectedCustomers.length} 个客户，排除后这些客户将不再出现在扫描结果和统计数据中，您可以在设置中恢复。`
                : '排除后该客户将不再出现在扫描结果和统计数据中，您可以在设置中恢复。'
              }
            </p>
            <div className="mb-4">
              <label className="text-sm text-slate-600 mb-1.5 block">排除原因</label>
              <textarea
                value={excludeReason}
                onChange={(e) => setExcludeReason(e.target.value)}
                placeholder="请输入排除原因..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setExcludeModal({ open: false })}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExclude}
                disabled={!excludeReason.trim()}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  excludeReason.trim()
                    ? 'bg-danger-500 text-white hover:bg-danger-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
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
