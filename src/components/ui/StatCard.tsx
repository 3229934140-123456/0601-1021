import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  subtitle?: string;
  loading?: boolean;
  delay?: number;
}

const colorMap = {
  primary: 'from-primary-500 to-primary-700',
  success: 'from-success-500 to-success-700',
  warning: 'from-warning-500 to-warning-700',
  danger: 'from-danger-500 to-danger-700',
  accent: 'from-accent-500 to-accent-700',
};

const bgColorMap = {
  primary: 'bg-primary-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
  danger: 'bg-danger-50',
  accent: 'bg-accent-50',
};

const textColorMap = {
  primary: 'text-primary-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
  accent: 'text-accent-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  subtitle,
  loading,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-800 animate-number-roll">
                {value}
              </h3>
            )}
            {trend && (
              <span className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                trend.isUp ? 'text-success-600 bg-success-50' : 'text-danger-600 bg-danger-50'
              )}>
                {trend.isUp ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
          colorMap[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {trend && subtitle === undefined && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className={cn(
            'text-xs font-medium',
            trend.isUp ? textColorMap[color] : 'text-danger-500'
          )}>
            {trend.isUp ? '较上周增长' : '较上周下降'} {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}
