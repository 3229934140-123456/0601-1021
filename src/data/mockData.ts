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
  LostReasonStat,
  TrendDataPoint,
  ExclusionItem,
  IndustryStat,
  RegionStat,
} from '@/types';

const industries = ['互联网', '金融', '制造业', '教育', '医疗', '零售', '能源', '房地产'];
const regions = ['华东', '华北', '华南', '华中', '西南', '西北', '东北'];
const stages = ['初步接触', '需求确认', '方案报价', '商务谈判', '合同签订'];
const levels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
const sources = ['官网咨询', '市场活动', '转介绍', '电话营销', '展会', '自媒体'];

const salesPeople: SalesPerson[] = [
  { id: 'sp1', name: '张伟', email: 'zhangwei@example.com', role: 'manager', teamId: 't1', teamName: '华东一区', currentLoad: 75, customerCount: 45, opportunityCount: 23, totalAmount: 5800000 },
  { id: 'sp2', name: '李娜', email: 'lina@example.com', role: 'sales', teamId: 't1', teamName: '华东一区', currentLoad: 60, customerCount: 38, opportunityCount: 18, totalAmount: 3200000 },
  { id: 'sp3', name: '王强', email: 'wangqiang@example.com', role: 'sales', teamId: 't1', teamName: '华东一区', currentLoad: 85, customerCount: 52, opportunityCount: 28, totalAmount: 4500000 },
  { id: 'sp4', name: '刘芳', email: 'liufang@example.com', role: 'sales', teamId: 't1', teamName: '华东一区', currentLoad: 55, customerCount: 32, opportunityCount: 15, totalAmount: 2800000 },
  { id: 'sp5', name: '陈明', email: 'chenming@example.com', role: 'manager', teamId: 't2', teamName: '华南大区', currentLoad: 70, customerCount: 42, opportunityCount: 20, totalAmount: 4800000 },
  { id: 'sp6', name: '赵丽', email: 'zhaoli@example.com', role: 'sales', teamId: 't2', teamName: '华南大区', currentLoad: 65, customerCount: 40, opportunityCount: 19, totalAmount: 3500000 },
  { id: 'sp7', name: '孙杰', email: 'sunjie@example.com', role: 'sales', teamId: 't2', teamName: '华南大区', currentLoad: 80, customerCount: 48, opportunityCount: 25, totalAmount: 4200000 },
];

const teams: Team[] = [
  { id: 't1', name: '华东一区', managerId: 'sp1', managerName: '张伟', description: '负责上海、江苏、浙江地区', memberCount: 4, customerCount: 167, totalAmount: 16300000 },
  { id: 't2', name: '华南大区', managerId: 'sp5', managerName: '陈明', description: '负责广东、福建、海南地区', memberCount: 3, customerCount: 130, totalAmount: 12500000 },
];

const customerNames = [
  '星辰科技有限公司', '恒信集团', '盈创数码', '众合实业', '远景科技',
  '鼎盛贸易', '恒泰金融', '新锐传媒', '博远教育', '康泰医疗',
  '万邦物流', '开元地产', '明德软件', '华盛电子', '中企通信',
  '锦程国际', '博瑞医疗', '鼎鑫投资', '启航教育', '天宇网络',
  '瑞丰商贸', '盛世科技', '恒远建设', '博纳文化', '金盾安防',
  '汇智科技', '远东国际', '恒信科技', '众邦实业', '远景集团',
  '鼎盛电子', '恒泰医药', '新锐科技', '博远贸易', '康泰生物',
  '万邦科技', '开元集团', '明德教育', '华盛通信', '中企数码',
];

function generateCustomers(): Customer[] {
  const customers: Customer[] = [];
  for (let i = 0; i < 50; i++) {
    const spIndex = i % salesPeople.length;
    const sp = salesPeople[spIndex];
    const daysAgo = Math.floor(Math.random() * 60);
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysAgo);
    
    customers.push({
      id: `c${i + 1}`,
      name: customerNames[i % customerNames.length],
      industry: industries[i % industries.length],
      region: regions[i % regions.length],
      level: levels[i % levels.length],
      contactPerson: ['张总', '李经理', '王主管', '刘总监', '陈经理'][i % 5],
      phone: `138${String(10000000 + i * 123).slice(0, 8)}`,
      email: `contact${i + 1}@company${i + 1}.com`,
      companySize: ['小型', '中型', '大型', '集团'][i % 4],
      lastContactDate: lastDate.toISOString().split('T')[0],
      status: i % 15 === 0 ? 'lost' : i % 10 === 0 ? 'inactive' : 'active',
      isDuplicate: i % 23 === 0,
      isHighValue: i % 8 === 0,
      isExcluded: i % 30 === 0,
      teamId: sp.teamId,
      salesPersonId: sp.id,
      salesPersonName: sp.name,
      daysSinceLastContact: daysAgo,
      followUpCount: Math.floor(Math.random() * 20) + 2,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  return customers;
}

function generateOpportunities(customers: Customer[]): Opportunity[] {
  const opportunities: Opportunity[] = [];
  let id = 1;
  
  customers.forEach((customer, ci) => {
    if (customer.status === 'lost') return;
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const stageIndex = Math.floor(Math.random() * stages.length);
      const isWon = Math.random() > 0.85;
      const isLost = !isWon && Math.random() > 0.8;
      const amount = Math.floor(Math.random() * 500000) + 50000;
      const heatScore = Math.floor(Math.random() * 60) + 30;
      
      const daysInStage = Math.floor(Math.random() * 90) + 5;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + Math.floor(Math.random() * 180));
      
      opportunities.push({
        id: `o${id++}`,
        customerId: customer.id,
        customerName: customer.name,
        name: `${customer.name}-${['合作项目', '采购项目', '系统升级', '服务续约', '新建项目'][i % 5]}`,
        amount,
        stage: isWon ? stages[stages.length - 1] : isLost ? '已丢单' : stages[stageIndex],
        probability: isWon ? 100 : isLost ? 0 : Math.floor(Math.random() * 70) + 20,
        heatScore,
        expectedCloseDate: expectedDate.toISOString().split('T')[0],
        lossReason: isLost ? ['价格过高', '竞品抢走', '需求变更', '预算取消', '决策人变动'][Math.floor(Math.random() * 5)] : undefined,
        status: isWon ? 'won' : isLost ? 'lost' : 'active',
        daysInCurrentStage: isWon ? 0 : isLost ? daysInStage : daysInStage,
        salesPersonId: customer.salesPersonId,
        salesPersonName: customer.salesPersonName,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  });
  
  return opportunities;
}

function generateFollowUps(customers: Customer[]): FollowUpRecord[] {
  const records: FollowUpRecord[] = [];
  let id = 1;
  const types: Array<'call' | 'meeting' | 'email' | 'visit'> = ['call', 'meeting', 'email', 'visit'];
  
  customers.forEach(customer => {
    const count = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      const type = types[Math.floor(Math.random() * types.length)];
      const hasContent = Math.random() > 0.2;
      const hasResult = Math.random() > 0.3;
      const hasNextPlan = Math.random() > 0.4;
      
      const completeness = [hasContent, hasResult, hasNextPlan].filter(Boolean).length;
      const completenessScore = Math.round((completeness / 3) * 100);
      
      records.push({
        id: `f${id++}`,
        customerId: customer.id,
        customerName: customer.name,
        date: date.toISOString().split('T')[0],
        type,
        content: hasContent ? '与客户沟通了项目需求，确认了关键参数和时间节点。客户对方案表示感兴趣。' : '',
        result: hasResult ? '客户同意进一步深入交流，预计下周提供反馈。' : '',
        nextPlan: hasNextPlan ? '下周安排产品演示会议，准备详细方案书。' : '',
        isComplete: completenessScore === 100,
        completenessScore,
        salesPersonId: customer.salesPersonId,
        salesPersonName: customer.salesPersonName,
      });
    }
  });
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateReminders(customers: Customer[], opportunities: Opportunity[]): Reminder[] {
  const reminders: Reminder[] = [];
  let id = 1;
  
  const longNoContact = customers.filter(c => c.daysSinceLastContact > 30 && c.status === 'active').slice(0, 8);
  longNoContact.forEach(customer => {
    reminders.push({
      id: `r${id++}`,
      salesPersonId: customer.salesPersonId,
      salesPersonName: customer.salesPersonName,
      type: 'follow_up',
      title: '长期未联系提醒',
      content: `${customer.name} 已 ${customer.daysSinceLastContact} 天未跟进，请尽快联系客户。`,
      priority: customer.level === 'A' ? 'high' : customer.level === 'B' ? 'medium' : 'low',
      isRead: false,
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date().toISOString().split('T')[0],
    });
  });
  
  const highValueVisits = customers.filter(c => c.isHighValue && c.daysSinceLastContact > 7).slice(0, 6);
  highValueVisits.forEach(customer => {
    reminders.push({
      id: `r${id++}`,
      salesPersonId: customer.salesPersonId,
      salesPersonName: customer.salesPersonName,
      type: 'visit',
      title: '今日必访 - 高价值客户',
      content: `${customer.name} 是 ${customer.level} 级高价值客户，建议安排拜访或电话沟通。`,
      priority: 'high',
      isRead: false,
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date().toISOString().split('T')[0],
    });
  });
  
  const deadlineOpps = opportunities.filter(o => o.status === 'active' && o.daysInCurrentStage > 30).slice(0, 6);
  deadlineOpps.forEach(opp => {
    reminders.push({
      id: `r${id++}`,
      salesPersonId: opp.salesPersonId,
      salesPersonName: opp.salesPersonName,
      type: 'deadline',
      title: '商机阶段停留过长',
      content: `商机「${opp.name}」在「${opp.stage}」阶段已停留 ${opp.daysInCurrentStage} 天，请推动进展。`,
      priority: 'medium',
      isRead: false,
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
      customerId: opp.customerId,
      customerName: opp.customerName,
      createdAt: new Date().toISOString().split('T')[0],
    });
  });
  
  const noContact = customers.filter(c => !c.contactPerson || c.contactPerson === '').slice(0, 4);
  noContact.forEach(customer => {
    reminders.push({
      id: `r${id++}`,
      salesPersonId: customer.salesPersonId,
      salesPersonName: customer.salesPersonName,
      type: 'contact',
      title: '请补充联系人信息',
      content: `${customer.name} 的联系人信息不完整，请补充关键决策人信息。`,
      priority: 'low',
      isRead: false,
      isCompleted: false,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date().toISOString().split('T')[0],
    });
  });
  
  return reminders;
}

function generateLeads(): Lead[] {
  const leads: Lead[] = [];
  const leadNames = [
    '新华科技', '宏图贸易', '建业集团', '盛达电子', '安信科技',
    '华瑞医疗', '明德教育', '汇通物流', '金凯瑞', '新视野',
    '智联科技', '万嘉集团', '鸿达贸易', '兴业电子', '恒信科技',
  ];
  
  for (let i = 0; i < 15; i++) {
    const isAssigned = i >= 8;
    const spIndex = isAssigned ? i % salesPeople.length : -1;
    
    leads.push({
      id: `l${i + 1}`,
      name: leadNames[i],
      company: `${leadNames[i]}有限公司`,
      phone: `139${String(10000000 + i * 234).slice(0, 8)}`,
      email: `lead${i + 1}@lead${i + 1}.com`,
      industry: industries[i % industries.length],
      source: sources[i % sources.length],
      status: i < 8 ? 'new' : i < 12 ? 'assigned' : 'contacted',
      assignedTo: isAssigned ? salesPeople[spIndex].id : undefined,
      assignedToName: isAssigned ? salesPeople[spIndex].name : undefined,
      assignedAt: isAssigned ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      score: Math.floor(Math.random() * 100) + 20,
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  
  return leads;
}

function generateExceptions(customers: Customer[], opportunities: Opportunity[]): ExceptionItem[] {
  const exceptions: ExceptionItem[] = [];
  let id = 1;
  
  const lostOpps = opportunities.filter(o => o.status === 'lost').slice(0, 10);
  lostOpps.forEach(opp => {
    exceptions.push({
      id: `e${id++}`,
      type: 'lost_reason',
      title: '丢单记录',
      description: `${opp.customerName} - ${opp.name} 已丢单，原因：${opp.lossReason || '未填写'}`,
      customerId: opp.customerId,
      customerName: opp.customerName,
      salesPersonId: opp.salesPersonId,
      salesPersonName: opp.salesPersonName,
      level: opp.amount > 200000 ? 'high' : 'medium',
      date: opp.updatedAt,
      resolved: false,
    });
  });
  
  const longStageOpps = opportunities.filter(o => o.status === 'active' && o.daysInCurrentStage > 60).slice(0, 8);
  longStageOpps.forEach(opp => {
    exceptions.push({
      id: `e${id++}`,
      type: 'long_stage',
      title: '阶段停留过长',
      description: `商机「${opp.name}」在「${opp.stage}」阶段已停留 ${opp.daysInCurrentStage} 天`,
      customerId: opp.customerId,
      customerName: opp.customerName,
      salesPersonId: opp.salesPersonId,
      salesPersonName: opp.salesPersonName,
      level: opp.daysInCurrentStage > 90 ? 'high' : 'medium',
      date: opp.updatedAt,
      resolved: false,
    });
  });
  
  const noContactCusts = customers.filter(c => c.daysSinceLastContact > 45 && c.status === 'active').slice(0, 6);
  noContactCusts.forEach(customer => {
    exceptions.push({
      id: `e${id++}`,
      type: 'no_contact',
      title: '长期未联系',
      description: `${customer.name} 已 ${customer.daysSinceLastContact} 天未跟进`,
      customerId: customer.id,
      customerName: customer.name,
      salesPersonId: customer.salesPersonId,
      salesPersonName: customer.salesPersonName,
      level: customer.level === 'A' ? 'high' : 'medium',
      date: customer.lastContactDate,
      resolved: false,
    });
  });
  
  const duplicateCusts = customers.filter(c => c.isDuplicate);
  duplicateCusts.forEach(customer => {
    exceptions.push({
      id: `e${id++}`,
      type: 'duplicate',
      title: '疑似重复客户',
      description: `${customer.name} 疑似与其他客户重复，请核实`,
      customerId: customer.id,
      customerName: customer.name,
      salesPersonId: customer.salesPersonId,
      salesPersonName: customer.salesPersonName,
      level: 'low',
      date: customer.createdAt,
      resolved: false,
    });
  });
  
  return exceptions;
}

function generateDailyReport(team: Team, customers: Customer[], opportunities: Opportunity[]): DailyReport {
  const teamCustomers = customers.filter(c => c.teamId === team.id);
  const teamOpps = opportunities.filter(o => {
    const cust = customers.find(c => c.id === o.customerId);
    return cust?.teamId === team.id;
  });
  
  return {
    date: new Date().toISOString().split('T')[0],
    teamId: team.id,
    teamName: team.name,
    totalCustomers: teamCustomers.length,
    newCustomers: teamCustomers.filter(c => {
      const daysSince = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    }).length,
    activeCustomers: teamCustomers.filter(c => c.status === 'active').length,
    totalOpportunities: teamOpps.length,
    newOpportunities: teamOpps.filter(o => {
      const daysSince = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    }).length,
    wonOpportunities: teamOpps.filter(o => o.status === 'won').length,
    lostOpportunities: teamOpps.filter(o => o.status === 'lost').length,
    totalAmount: teamOpps.reduce((sum, o) => sum + o.amount, 0),
    wonAmount: teamOpps.filter(o => o.status === 'won').reduce((sum, o) => sum + o.amount, 0),
    followUpCount: Math.floor(teamCustomers.length * 0.7),
    reminderCount: Math.floor(teamCustomers.length * 0.15),
    completedReminders: Math.floor(teamCustomers.length * 0.08),
    exceptionCount: Math.floor(teamCustomers.length * 0.1),
    newLeads: Math.floor(Math.random() * 5) + 2,
    convertedLeads: Math.floor(Math.random() * 3) + 1,
  };
}

function generateTrendData(): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      newCustomers: Math.floor(Math.random() * 8) + 2,
      newOpportunities: Math.floor(Math.random() * 6) + 1,
      followUps: Math.floor(Math.random() * 30) + 15,
      wonAmount: Math.floor(Math.random() * 500000) + 100000,
    });
  }
  return data;
}

function generateTeamDailyReports(team: Team, customers: Customer[], opportunities: Opportunity[], followUps: FollowUpRecord[]): DailyReport[] {
  const reports: DailyReport[] = [];
  const teamCustomers = customers.filter(c => c.teamId === team.id);
  const teamCustomerIds = teamCustomers.map(c => c.id);
  const teamOpps = opportunities.filter(o => teamCustomerIds.includes(o.customerId));
  const teamFollowUps = followUps.filter(f => teamCustomerIds.includes(f.customerId));
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dateTime = date.getTime();
    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const dayNewCustomers = teamCustomers.filter(c => {
      const t = new Date(c.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    
    const dayNewOpps = teamOpps.filter(o => {
      const t = new Date(o.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    
    const dayFollowUps = teamFollowUps.filter(f => {
      const t = new Date(f.date).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    
    const dayWonOpps = teamOpps.filter(o => {
      if (o.status !== 'won') return false;
      const t = new Date(o.updatedAt).getTime();
      return t >= dayStart && t < dayEnd;
    });
    const dayWonAmount = dayWonOpps.reduce((s, o) => s + o.amount, 0);
    
    const cumulativeCustomers = teamCustomers.filter(c => 
      new Date(c.createdAt).getTime() < dayEnd
    ).length;
    
    const cumulativeOpps = teamOpps.filter(o => 
      new Date(o.createdAt).getTime() < dayEnd
    ).length;
    
    const cumulativeWonOpps = teamOpps.filter(o => 
      o.status === 'won' && new Date(o.updatedAt).getTime() < dayEnd
    ).length;
    
    const cumulativeAmount = teamOpps.filter(o => 
      new Date(o.createdAt).getTime() < dayEnd
    ).reduce((s, o) => s + o.amount, 0);
    
    const cumulativeWonAmount = teamOpps.filter(o => 
      o.status === 'won' && new Date(o.updatedAt).getTime() < dayEnd
    ).reduce((s, o) => s + o.amount, 0);
    
    reports.push({
      date: dateStr,
      teamId: team.id,
      teamName: team.name,
      totalCustomers: cumulativeCustomers,
      newCustomers: dayNewCustomers,
      activeCustomers: Math.floor(cumulativeCustomers * 0.85),
      totalOpportunities: cumulativeOpps,
      newOpportunities: dayNewOpps,
      wonOpportunities: cumulativeWonOpps,
      lostOpportunities: Math.floor(cumulativeOpps * 0.15),
      totalAmount: cumulativeAmount,
      wonAmount: cumulativeWonAmount,
      followUpCount: dayFollowUps,
      reminderCount: Math.floor(cumulativeCustomers * 0.15),
      completedReminders: Math.floor(cumulativeCustomers * 0.08),
      exceptionCount: Math.floor(cumulativeOpps * 0.1),
      newLeads: Math.floor(Math.random() * 5) + 2,
      convertedLeads: Math.floor(Math.random() * 3) + 1,
    });
  }
  
  return reports;
}

function generateLostReasons(): LostReasonStat[] {
  return [
    { reason: '价格过高', count: 12, amount: 2400000, percentage: 30 },
    { reason: '竞品抢走', count: 10, amount: 1800000, percentage: 25 },
    { reason: '需求变更', count: 8, amount: 1500000, percentage: 20 },
    { reason: '预算取消', count: 6, amount: 1200000, percentage: 15 },
    { reason: '决策人变动', count: 4, amount: 800000, percentage: 10 },
  ];
}

function generateIndustryStats(customers: Customer[], opportunities: Opportunity[]): IndustryStat[] {
  const stats: Record<string, IndustryStat> = {};
  
  customers.forEach(c => {
    if (!stats[c.industry]) {
      stats[c.industry] = { industry: c.industry, customerCount: 0, opportunityCount: 0, amount: 0 };
    }
    stats[c.industry].customerCount++;
  });
  
  opportunities.forEach(o => {
    const cust = customers.find(c => c.id === o.customerId);
    if (cust && stats[cust.industry]) {
      stats[cust.industry].opportunityCount++;
      stats[cust.industry].amount += o.amount;
    }
  });
  
  return Object.values(stats);
}

function generateRegionStats(customers: Customer[], opportunities: Opportunity[]): RegionStat[] {
  const stats: Record<string, RegionStat> = {};
  
  customers.forEach(c => {
    if (!stats[c.region]) {
      stats[c.region] = { region: c.region, customerCount: 0, opportunityCount: 0, amount: 0 };
    }
    stats[c.region].customerCount++;
  });
  
  opportunities.forEach(o => {
    const cust = customers.find(c => c.id === o.customerId);
    if (cust && stats[cust.region]) {
      stats[cust.region].opportunityCount++;
      stats[cust.region].amount += o.amount;
    }
  });
  
  return Object.values(stats);
}

function generateExclusions(customers: Customer[]): ExclusionItem[] {
  const excluded = customers.filter(c => c.isExcluded);
  return excluded.map(c => ({
    id: `ex${c.id}`,
    customerId: c.id,
    customerName: c.name,
    reason: '客户暂无意向，转入维护期',
    excludedBy: '张伟',
    excludedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

export const mockData = {
  customers: generateCustomers(),
  opportunities: generateOpportunities(generateCustomers()),
  followUpRecords: generateFollowUps(generateCustomers()),
  reminders: [] as Reminder[],
  leads: generateLeads(),
  salesPeople,
  teams,
  exceptions: [] as ExceptionItem[],
  dailyReports: [] as DailyReport[],
  trendData: generateTrendData(),
  lostReasons: generateLostReasons(),
  industryStats: [] as IndustryStat[],
  regionStats: [] as RegionStat[],
  exclusions: [] as ExclusionItem[],
};

const customers = generateCustomers();
const opportunities = generateOpportunities(customers);

mockData.customers = customers;
mockData.opportunities = opportunities;
mockData.followUpRecords = generateFollowUps(customers);
mockData.reminders = generateReminders(customers, opportunities);
mockData.exceptions = generateExceptions(customers, opportunities);
mockData.dailyReports = teams.flatMap(t => generateTeamDailyReports(t, customers, opportunities, mockData.followUpRecords));
mockData.industryStats = generateIndustryStats(customers, opportunities);
mockData.regionStats = generateRegionStats(customers, opportunities);
mockData.exclusions = generateExclusions(customers);

export default mockData;
