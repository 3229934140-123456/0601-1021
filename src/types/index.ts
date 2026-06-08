export interface Customer {
  id: string;
  name: string;
  industry: string;
  region: string;
  level: 'A' | 'B' | 'C' | 'D';
  contactPerson: string;
  phone: string;
  email: string;
  companySize: string;
  lastContactDate: string;
  status: 'active' | 'inactive' | 'lost';
  isDuplicate: boolean;
  isHighValue: boolean;
  isExcluded: boolean;
  teamId: string;
  salesPersonId: string;
  salesPersonName: string;
  daysSinceLastContact: number;
  followUpCount: number;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  heatScore: number;
  expectedCloseDate: string;
  lossReason?: string;
  status: 'active' | 'won' | 'lost';
  daysInCurrentStage: number;
  salesPersonId: string;
  salesPersonName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpRecord {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  type: 'call' | 'meeting' | 'email' | 'visit';
  content: string;
  result: string;
  nextPlan: string;
  isComplete: boolean;
  completenessScore: number;
  salesPersonId: string;
  salesPersonName: string;
}

export interface Reminder {
  id: string;
  salesPersonId: string;
  salesPersonName: string;
  type: 'visit' | 'follow_up' | 'contact' | 'deadline' | 'duplicate';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  isCompleted: boolean;
  dueDate: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  handledAt?: string;
  handledBy?: string;
  handleNote?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  source: string;
  status: 'new' | 'assigned' | 'contacted' | 'converted';
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  score: number;
  createdAt: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'sales';
  teamId: string;
  teamName: string;
  currentLoad: number;
  customerCount: number;
  opportunityCount: number;
  totalAmount: number;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  managerName: string;
  description: string;
  memberCount: number;
  customerCount: number;
  totalAmount: number;
}

export interface StageHistory {
  id: string;
  opportunityId: string;
  stage: string;
  daysInStage: number;
  enterDate: string;
  leaveDate?: string;
}

export interface ExceptionItem {
  id: string;
  type: 'lost_reason' | 'long_stage' | 'no_contact' | 'duplicate' | 'incomplete';
  title: string;
  description: string;
  customerId?: string;
  customerName?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  level: 'high' | 'medium' | 'low';
  date: string;
  resolved: boolean;
}

export interface DailyReport {
  date: string;
  teamId: string;
  teamName: string;
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  totalOpportunities: number;
  newOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  totalAmount: number;
  wonAmount: number;
  followUpCount: number;
  reminderCount: number;
  completedReminders: number;
  exceptionCount: number;
  newLeads: number;
  convertedLeads: number;
}

export interface LostReasonStat {
  reason: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface IndustryStat {
  industry: string;
  customerCount: number;
  opportunityCount: number;
  amount: number;
}

export interface RegionStat {
  region: string;
  customerCount: number;
  opportunityCount: number;
  amount: number;
}

export interface TrendDataPoint {
  date: string;
  newCustomers: number;
  newOpportunities: number;
  followUps: number;
  wonAmount: number;
}

export interface ExclusionItem {
  id: string;
  customerId: string;
  customerName: string;
  reason: string;
  excludedBy: string;
  excludedAt: string;
}

export interface AssignmentRecord {
  id: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  salesPersonId: string;
  salesPersonName: string;
  strategy: 'round_robin' | 'load_balance' | 'industry_match' | 'manual';
  assignedBy: string;
  assignedAt: string;
}
