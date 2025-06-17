"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  description?: string;
  trend?: number[];
  className?: string;
  loading?: boolean;
}

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-blue-600",
  description,
  trend,
  className,
  loading = false,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case "increase":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "neutral":
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (!change) return "";
    
    switch (change.type) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg bg-opacity-10", iconColor.replace('text-', 'bg-'))}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          
          {/* Mini trend indicator */}
          {trend && trend.length > 0 && (
            <div className="flex items-center space-x-1">
              {trend.slice(-5).map((point, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1 rounded-full",
                    point > 0 ? "bg-green-400" : "bg-gray-300"
                  )}
                  style={{ height: `${Math.max(4, Math.abs(point) * 2)}px` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-3xl font-bold text-gray-900">
            {formatValue(value)}
          </div>

          {change && (
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getChangeColor())}>
                {change.value}
              </span>
              {change.period && (
                <span className="text-sm text-gray-500">{change.period}</span>
              )}
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedStatsCard;