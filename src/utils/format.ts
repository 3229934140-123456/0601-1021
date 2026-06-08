export function formatMoney(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}千万`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`;
  }
  return amount.toLocaleString('zh-CN');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'A': return 'bg-danger-50 text-danger-600 border-danger-200';
    case 'B': return 'bg-warning-50 text-warning-600 border-warning-200';
    case 'C': return 'bg-primary-50 text-primary-600 border-primary-200';
    case 'D': return 'bg-slate-50 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-danger-50 text-danger-600';
    case 'medium': return 'bg-warning-50 text-warning-600';
    case 'low': return 'bg-slate-50 text-slate-600';
    default: return 'bg-slate-50 text-slate-600';
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high': return '高优先级';
    case 'medium': return '中优先级';
    case 'low': return '低优先级';
    default: return '低优先级';
  }
}

export function getFollowUpTypeLabel(type: string): string {
  switch (type) {
    case 'call': return '电话';
    case 'meeting': return '会议';
    case 'email': return '邮件';
    case 'visit': return '拜访';
    default: return type;
  }
}

export function getFollowUpTypeColor(type: string): string {
  switch (type) {
    case 'call': return 'bg-primary-50 text-primary-600';
    case 'meeting': return 'bg-success-50 text-success-600';
    case 'email': return 'bg-accent-50 text-accent-600';
    case 'visit': return 'bg-warning-50 text-warning-600';
    default: return 'bg-slate-50 text-slate-600';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return '活跃';
    case 'inactive': return '不活跃';
    case 'lost': return '已流失';
    case 'won': return '已成交';
    case 'new': return '新线索';
    case 'assigned': return '已分配';
    case 'contacted': return '已联系';
    case 'converted': return '已转化';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'won':
    case 'converted':
      return 'bg-success-50 text-success-600';
    case 'inactive':
    case 'assigned':
      return 'bg-warning-50 text-warning-600';
    case 'lost':
      return 'bg-danger-50 text-danger-600';
    case 'new':
      return 'bg-primary-50 text-primary-600';
    case 'contacted':
      return 'bg-accent-50 text-accent-600';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}

export function getHeatScoreColor(score: number): string {
  if (score >= 80) return 'text-danger-500';
  if (score >= 60) return 'text-warning-500';
  if (score >= 40) return 'text-primary-500';
  return 'text-slate-400';
}

export function getHeatScoreBg(score: number): string {
  if (score >= 80) return 'from-danger-500 to-danger-600';
  if (score >= 60) return 'from-warning-500 to-warning-600';
  if (score >= 40) return 'from-primary-500 to-primary-600';
  return 'from-slate-400 to-slate-500';
}
