import { LucideIcon } from "lucide-react";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "gradient-primary",
    success: "gradient-success",
    warning: "gradient-warning",
    danger: "gradient-danger",
  };

  return (
    <Card className="card-shadow hover:card-shadow-hover transition-smooth">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
            {trend && (
              <p className={`text-sm mt-2 ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className={`w-16 h-16 rounded-lg ${variantStyles[variant]} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}
