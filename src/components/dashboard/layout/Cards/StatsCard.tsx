"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatsCardProps } from "@/interfaces/dashboard/dashboardInterface";

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-blue-600",
  showViewReport = true,
  className,
}) => {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className={cn("w-6 h-6", iconColor)} />
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-2xl font-bold text-gray-900">{value}</div>

          {change && (
            <div className="flex items-center space-x-2">
              {change.type === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change.type === "increase" ? "text-green-600" : "text-red-600"
                )}
              >
                {change.value}
              </span>
              <span className="text-sm text-gray-500">{change.period}</span>
            </div>
          )}

          {showViewReport && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              View Report →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
