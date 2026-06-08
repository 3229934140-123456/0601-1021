import { create } from 'zustand';
import mockData from '@/data/mockData';
import type {
  Customer,
  Opportunity,
  FollowUpRecord,
  Reminder,
  Lead,
  SalesPerson,
  Team,
  ExceptionItem,
  DailyReport,
  TrendDataPoint,
  LostReasonStat,
  ExclusionItem,
  IndustryStat,
  RegionStat,
} from '@/types';

interface CustomerFilters {
  teamId?: string;
  industry?: string;
  region?: string;
  level?: string;
  status?: string;
  keyword?: string;
  onlyLongNoContact?: boolean;
  onlyHighValue?: boolean;
  onlyDuplicate?: boolean;
  excludeExcluded?: boolean;
}

interface CRMStore {
  customers: Customer[];
  opportunities: Opportunity[];
  followUpRecords: FollowUpRecord[];
  reminders: Reminder[];
  leads: Lead[];
  salesPeople: SalesPerson[];
  teams: Team[];
  exceptions: ExceptionItem[];
  dailyReports: DailyReport[];
  trendData: TrendDataPoint[];
  lostReasons: LostReasonStat[];
  industryStats: IndustryStat[];
  regionStats: RegionStat[];
  exclusions: ExclusionItem[];
  
  customerFilters: CustomerFilters;
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
  
  filteredCustomers: Customer[];
  longNoContactCustomers: Customer[];
  duplicateCustomers: Customer[];
  highValueCustomers: Customer[];
  
  markReminderRead: (id: string) => void;
  markReminderCompleted: (id: string) => void;
  
  assignLead: (leadId: string, salesPersonId: string) => void;
  batchAssignLeads: (strategy: 'round_robin' | 'load_balance' | 'industry_match') => void;
  
  excludeCustomer: (customerId: string, reason: string) => void;
  removeExclusion: (customerId: string) => void;
  
  resolveException: (exceptionId: string) => void;
  
  refreshAll: () => void;
}

export const useCRMStore = create<CRMStore>((set, get) => ({
  ...mockData,
  
  customerFilters: {
    excludeExcluded: true,
  },
  
  setCustomerFilters: (filters) => set((state) => ({
    customerFilters: { ...state.customerFilters, ...filters },
  })),
  
  get filteredCustomers() {
    const { customers, customerFilters } = get();
    let result = [...customers];
    
    if (customerFilters.excludeExcluded) {
      result = result.filter(c => !c.isExcluded);
    }
    
    if (customerFilters.teamId) {
      result = result.filter(c => c.teamId === customerFilters.teamId);
    }
    
    if (customerFilters.industry) {
      result = result.filter(c => c.industry === customerFilters.industry);
    }
    
    if (customerFilters.region) {
      result = result.filter(c => c.region === customerFilters.region);
    }
    
    if (customerFilters.level) {
      result = result.filter(c => c.level === customerFilters.level);
    }
    
    if (customerFilters.status) {
      result = result.filter(c => c.status === customerFilters.status);
    }
    
    if (customerFilters.keyword) {
      const kw = customerFilters.keyword.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(kw) ||
        c.contactPerson.toLowerCase().includes(kw) ||
        c.phone.includes(kw)
      );
    }
    
    if (customerFilters.onlyLongNoContact) {
      result = result.filter(c => c.daysSinceLastContact > 30 && c.status === 'active');
    }
    
    if (customerFilters.onlyHighValue) {
      result = result.filter(c => c.isHighValue);
    }
    
    if (customerFilters.onlyDuplicate) {
      result = result.filter(c => c.isDuplicate);
    }
    
    return result;
  },
  
  get longNoContactCustomers() {
    return get().customers.filter(c => c.daysSinceLastContact > 30 && c.status === 'active' && !c.isExcluded);
  },
  
  get duplicateCustomers() {
    return get().customers.filter(c => c.isDuplicate && !c.isExcluded);
  },
  
  get highValueCustomers() {
    return get().customers.filter(c => c.isHighValue && !c.isExcluded);
  },
  
  markReminderRead: (id) => set((state) => ({
    reminders: state.reminders.map(r => r.id === id ? { ...r, isRead: true } : r),
  })),
  
  markReminderCompleted: (id) => set((state) => ({
    reminders: state.reminders.map(r => r.id === id ? { 
      ...r, 
      isCompleted: true, 
      isRead: true,
      handledAt: new Date().toISOString(),
      handledBy: '当前用户',
    } : r),
  })),
  
  assignLead: (leadId, salesPersonId) => {
    const sp = get().salesPeople.find(s => s.id === salesPersonId);
    set((state) => ({
      leads: state.leads.map(l => l.id === leadId ? {
        ...l,
        status: 'assigned',
        assignedTo: salesPersonId,
        assignedToName: sp?.name,
        assignedAt: new Date().toISOString().split('T')[0],
      } : l),
      salesPeople: state.salesPeople.map(s => s.id === salesPersonId ? {
        ...s,
        currentLoad: s.currentLoad + 5,
      } : s),
    }));
  },
  
  batchAssignLeads: (strategy) => {
    const { leads, salesPeople } = get();
    const newLeads = leads.filter(l => l.status === 'new');
    const activeSales = salesPeople.filter(s => s.role === 'sales');
    
    if (newLeads.length === 0 || activeSales.length === 0) return;
    
    let assignedPairs: { leadId: string; salesPersonId: string }[] = [];
    
    if (strategy === 'load_balance') {
      const sorted = [...activeSales].sort((a, b) => a.currentLoad - b.currentLoad);
      newLeads.forEach((lead, idx) => {
        const sp = sorted[idx % sorted.length];
        assignedPairs.push({ leadId: lead.id, salesPersonId: sp.id });
      });
    } else if (strategy === 'industry_match') {
      newLeads.forEach(lead => {
        const bestMatch = activeSales.reduce((best, sp) => {
          const spCustomers = get().customers.filter(c => c.salesPersonId === sp.id);
          const sameIndustry = spCustomers.filter(c => c.industry === lead.industry).length;
          return sameIndustry > best.count ? { sp, count: sameIndustry } : best;
        }, { sp: activeSales[0], count: -1 });
        assignedPairs.push({ leadId: lead.id, salesPersonId: bestMatch.sp.id });
      });
    } else {
      newLeads.forEach((lead, idx) => {
        const sp = activeSales[idx % activeSales.length];
        assignedPairs.push({ leadId: lead.id, salesPersonId: sp.id });
      });
    }
    
    set((state) => {
      const updatedLeads = state.leads.map(l => {
        const pair = assignedPairs.find(p => p.leadId === l.id);
        if (pair) {
          const sp = state.salesPeople.find(s => s.id === pair.salesPersonId);
          return {
            ...l,
            status: 'assigned' as const,
            assignedTo: sp?.id,
            assignedToName: sp?.name,
            assignedAt: new Date().toISOString().split('T')[0],
          };
        }
        return l;
      });
      
      const updatedSales = state.salesPeople.map(s => {
        const count = assignedPairs.filter(p => p.salesPersonId === s.id).length;
        return count > 0 ? { ...s, currentLoad: s.currentLoad + count * 5 } : s;
      });
      
      return { leads: updatedLeads, salesPeople: updatedSales };
    });
  },
  
  excludeCustomer: (customerId, reason) => set((state) => {
    const customer = state.customers.find(c => c.id === customerId);
    if (!customer) return state;
    
    const newExclusion: ExclusionItem = {
      id: `ex${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      reason,
      excludedBy: '当前用户',
      excludedAt: new Date().toISOString().split('T')[0],
    };
    
    return {
      customers: state.customers.map(c => c.id === customerId ? { ...c, isExcluded: true } : c),
      exclusions: [...state.exclusions, newExclusion],
    };
  }),
  
  removeExclusion: (customerId) => set((state) => ({
    customers: state.customers.map(c => c.id === customerId ? { ...c, isExcluded: false } : c),
    exclusions: state.exclusions.filter(e => e.customerId !== customerId),
  })),
  
  resolveException: (exceptionId) => set((state) => ({
    exceptions: state.exceptions.map(e => e.id === exceptionId ? { ...e, resolved: true } : e),
  })),
  
  refreshAll: () => set({
    ...mockData,
  }),
}));

export default useCRMStore;
