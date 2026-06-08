import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

interface FollowUpFilters {
  teamId?: string;
  salesPersonId?: string;
}

interface ReportFilters {
  dateRange: '7days' | '30days' | '90days';
  teamId?: string;
}

interface CRMState {
  customers: Customer[];
  opportunities: Opportunity[];
  followUpRecords: FollowUpRecord[];
  reminders: Reminder[];
  leads: Lead[];
  exclusions: ExclusionItem[];
  exceptions: ExceptionItem[];
  
  customerFilters: CustomerFilters;
  followUpFilters: FollowUpFilters;
  reportFilters: ReportFilters;
  
  baseCustomers: Customer[];
  baseOpportunities: Opportunity[];
  baseFollowUpRecords: FollowUpRecord[];
  baseReminders: Reminder[];
  baseLeads: Lead[];
  baseExclusions: ExclusionItem[];
  baseExceptions: ExceptionItem[];
  
  salesPeople: SalesPerson[];
  teams: Team[];
  dailyReports: DailyReport[];
  trendData: TrendDataPoint[];
  lostReasons: LostReasonStat[];
  industryStats: IndustryStat[];
  regionStats: RegionStat[];
}

interface CRMActions {
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
  setFollowUpFilters: (filters: Partial<FollowUpFilters>) => void;
  setReportFilters: (filters: Partial<ReportFilters>) => void;
  
  getFilteredCustomers: () => Customer[];
  getFilteredFollowUps: () => FollowUpRecord[];
  getFilteredIncompleteFollowUps: () => FollowUpRecord[];
  getFilteredIncompleteContacts: () => Customer[];
  getFilteredLongStageOpps: () => Opportunity[];
  getFilteredReminders: () => Reminder[];
  getFilteredTrendData: () => TrendDataPoint[];
  
  markReminderRead: (id: string) => void;
  markAllRemindersRead: () => void;
  markReminderCompleted: (id: string) => void;
  
  assignLead: (leadId: string, salesPersonId: string) => void;
  batchAssignLeads: (strategy: 'round_robin' | 'load_balance' | 'industry_match') => void;
  
  excludeCustomer: (customerId: string, reason: string) => void;
  batchExcludeCustomers: (customerIds: string[], reason: string) => void;
  removeExclusion: (customerId: string) => void;
  
  toggleHighValue: (customerId: string, isHighValue: boolean) => void;
  batchMarkHighValue: (customerIds: string[], isHighValue: boolean) => void;
  
  resolveException: (exceptionId: string) => void;
  
  refreshAll: () => void;
}

type CRMStore = CRMState & CRMActions;

const initialState: CRMState = {
  ...mockData,
  
  baseCustomers: mockData.customers,
  baseOpportunities: mockData.opportunities,
  baseFollowUpRecords: mockData.followUpRecords,
  baseReminders: mockData.reminders,
  baseLeads: mockData.leads,
  baseExclusions: mockData.exclusions,
  baseExceptions: mockData.exceptions,
  
  customerFilters: {
    excludeExcluded: true,
  },
  
  followUpFilters: {},
  
  reportFilters: {
    dateRange: '30days',
  },
};

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCustomerFilters: (filters) => set((state) => ({
        customerFilters: { ...state.customerFilters, ...filters },
      })),
      
      setFollowUpFilters: (filters) => set((state) => ({
        followUpFilters: { ...state.followUpFilters, ...filters },
      })),
      
      setReportFilters: (filters) => set((state) => ({
        reportFilters: { ...state.reportFilters, ...filters },
      })),
      
      getFilteredCustomers: () => {
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
      
      getFilteredFollowUps: () => {
        const { followUpRecords, followUpFilters, customers } = get();
        let result = [...followUpRecords];
        
        if (followUpFilters.teamId) {
          const teamCustomerIds = customers
            .filter(c => c.teamId === followUpFilters.teamId)
            .map(c => c.id);
          result = result.filter(r => teamCustomerIds.includes(r.customerId));
        }
        
        if (followUpFilters.salesPersonId) {
          result = result.filter(r => r.salesPersonId === followUpFilters.salesPersonId);
        }
        
        return result;
      },
      
      getFilteredIncompleteFollowUps: () => {
        return get().getFilteredFollowUps().filter(r => !r.isComplete);
      },
      
      getFilteredIncompleteContacts: () => {
        const { customers, followUpFilters } = get();
        let result = customers.filter(c => 
          !c.contactPerson || !c.phone || !c.email
        );
        
        if (followUpFilters.teamId) {
          result = result.filter(c => c.teamId === followUpFilters.teamId);
        }
        
        if (followUpFilters.salesPersonId) {
          result = result.filter(c => c.salesPersonId === followUpFilters.salesPersonId);
        }
        
        return result;
      },
      
      getFilteredLongStageOpps: () => {
        const { opportunities, followUpFilters, customers } = get();
        let result = opportunities.filter(o => 
          o.status === 'active' && o.daysInCurrentStage > 30
        );
        
        if (followUpFilters.teamId) {
          const teamCustomerIds = customers
            .filter(c => c.teamId === followUpFilters.teamId)
            .map(c => c.id);
          result = result.filter(o => teamCustomerIds.includes(o.customerId));
        }
        
        if (followUpFilters.salesPersonId) {
          result = result.filter(o => o.salesPersonId === followUpFilters.salesPersonId);
        }
        
        return result;
      },
      
      getFilteredReminders: () => {
        const { reminders, followUpFilters } = get();
        let result = [...reminders];
        
        if (followUpFilters.salesPersonId) {
          result = result.filter(r => r.salesPersonId === followUpFilters.salesPersonId);
        } else if (followUpFilters.teamId) {
          const { salesPeople } = get();
          const teamMemberIds = salesPeople
            .filter(sp => sp.teamId === followUpFilters.teamId)
            .map(sp => sp.id);
          result = result.filter(r => teamMemberIds.includes(r.salesPersonId));
        }
        
        return result;
      },
      
      getFilteredTrendData: () => {
        const { trendData, reportFilters } = get();
        const days = reportFilters.dateRange === '7days' ? 7 : 
                     reportFilters.dateRange === '30days' ? 30 : 90;
        return trendData.slice(-days);
      },
      
      markReminderRead: (id) => set((state) => ({
        reminders: state.reminders.map(r => r.id === id ? { ...r, isRead: true } : r),
      })),
      
      markAllRemindersRead: () => set((state) => {
        const { followUpFilters } = state;
        let filteredIds = state.reminders.filter(r => !r.isRead).map(r => r.id);
        
        if (followUpFilters.salesPersonId) {
          filteredIds = state.reminders
            .filter(r => r.salesPersonId === followUpFilters.salesPersonId && !r.isRead)
            .map(r => r.id);
        } else if (followUpFilters.teamId) {
          const teamMemberIds = state.salesPeople
            .filter(sp => sp.teamId === followUpFilters.teamId)
            .map(sp => sp.id);
          filteredIds = state.reminders
            .filter(r => teamMemberIds.includes(r.salesPersonId) && !r.isRead)
            .map(r => r.id);
        }
        
        return {
          reminders: state.reminders.map(r => 
            filteredIds.includes(r.id) ? { ...r, isRead: true } : r
          ),
        };
      }),
      
      markReminderCompleted: (id) => set((state) => ({
        reminders: state.reminders.map(r => r.id === id ? { 
          ...r, 
          isCompleted: true, 
          isRead: true,
          handledAt: new Date().toISOString(),
          handledBy: '张主管',
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
        const { leads, salesPeople, customers } = get();
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
              const spCustomers = customers.filter(c => c.salesPersonId === sp.id);
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
          id: `ex${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerId: customer.id,
          customerName: customer.name,
          reason,
          excludedBy: '张主管',
          excludedAt: new Date().toISOString().split('T')[0],
        };
        
        return {
          customers: state.customers.map(c => c.id === customerId ? { ...c, isExcluded: true } : c),
          exclusions: [...state.exclusions, newExclusion],
        };
      }),
      
      batchExcludeCustomers: (customerIds, reason) => set((state) => {
        const now = new Date().toISOString().split('T')[0];
        const newExclusions: ExclusionItem[] = customerIds
          .map(id => {
            const customer = state.customers.find(c => c.id === id);
            if (!customer || customer.isExcluded) return null;
            return {
              id: `ex${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              customerId: customer.id,
              customerName: customer.name,
              reason,
              excludedBy: '张主管',
              excludedAt: now,
            };
          })
          .filter((e): e is ExclusionItem => e !== null);
        
        return {
          customers: state.customers.map(c => 
            customerIds.includes(c.id) ? { ...c, isExcluded: true } : c
          ),
          exclusions: [...state.exclusions, ...newExclusions],
        };
      }),
      
      removeExclusion: (customerId) => set((state) => ({
        customers: state.customers.map(c => c.id === customerId ? { ...c, isExcluded: false } : c),
        exclusions: state.exclusions.filter(e => e.customerId !== customerId),
      })),
      
      toggleHighValue: (customerId, isHighValue) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === customerId ? { ...c, isHighValue } : c
        ),
      })),
      
      batchMarkHighValue: (customerIds, isHighValue) => set((state) => ({
        customers: state.customers.map(c => 
          customerIds.includes(c.id) ? { ...c, isHighValue } : c
        ),
      })),
      
      resolveException: (exceptionId) => set((state) => ({
        exceptions: state.exceptions.map(e => e.id === exceptionId ? { ...e, resolved: true } : e),
      })),
      
      refreshAll: () => set((state) => {
        const preservedReminders = state.reminders;
        const preservedLeads = state.leads;
        const preservedExclusions = state.exclusions;
        const preservedExceptions = state.exceptions;
        const preservedCustomers = state.customers;
        
        const updatedCustomers = mockData.customers.map(c => {
          const preserved = preservedCustomers.find(pc => pc.id === c.id);
          if (preserved) {
            return {
              ...c,
              isExcluded: preserved.isExcluded,
              isHighValue: preserved.isHighValue,
            };
          }
          return c;
        });
        
        const mergedReminders = mockData.reminders.map(r => {
          const preserved = preservedReminders.find(pr => pr.id === r.id);
          if (preserved) {
            return {
              ...r,
              isRead: preserved.isRead,
              isCompleted: preserved.isCompleted,
              handledAt: preserved.handledAt,
              handledBy: preserved.handledBy,
            };
          }
          return r;
        });
        
        const newReminderIds = new Set(mockData.reminders.map(r => r.id));
        const extraPreservedReminders = preservedReminders.filter(
          pr => !newReminderIds.has(pr.id)
        );
        
        const mergedLeads = mockData.leads.map(l => {
          const preserved = preservedLeads.find(pl => pl.id === l.id);
          if (preserved) {
            return {
              ...l,
              status: preserved.status,
              assignedTo: preserved.assignedTo,
              assignedToName: preserved.assignedToName,
              assignedAt: preserved.assignedAt,
            };
          }
          return l;
        });
        
        const mergedExceptions = mockData.exceptions.map(e => {
          const preserved = preservedExceptions.find(pe => pe.id === e.id);
          if (preserved) {
            return { ...e, resolved: preserved.resolved };
          }
          return e;
        });
        
        const newExceptionIds = new Set(mockData.exceptions.map(e => e.id));
        const extraPreservedExceptions = preservedExceptions.filter(
          pe => !newExceptionIds.has(pe.id)
        );
        
        const allExclusions = [...preservedExclusions];
        
        return {
          ...mockData,
          customers: updatedCustomers,
          reminders: [...mergedReminders, ...extraPreservedReminders],
          leads: mergedLeads,
          exclusions: allExclusions,
          exceptions: [...mergedExceptions, ...extraPreservedExceptions],
        };
      }),
    }),
    {
      name: 'crm-automation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customers: state.customers,
        reminders: state.reminders,
        leads: state.leads,
        exclusions: state.exclusions,
        exceptions: state.exceptions,
        customerFilters: state.customerFilters,
        followUpFilters: state.followUpFilters,
        reportFilters: state.reportFilters,
      }),
    }
  )
);

export default useCRMStore;
