"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecentActivityTableProps } from "@/interfaces/dashboard/dashboardInterface";

const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  title = "Recent Activity",
  data = [],
  showTimeFilter = true,
  className,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Member", variant: "secondary" as const },
      pending: { label: "Signed Up", variant: "outline" as const },
      failed: { label: "Failed", variant: "destructive" as const },
      new: { label: "New Customer", variant: "default" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>

          {showTimeFilter && (
            <Select defaultValue="last-24h">
              <SelectTrigger className="w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-24h">Last 24h</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-3">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Customer ID</div>
            <div className="col-span-2">Refund</div>
            <div className="col-span-2">Amount</div>
          </div>

          {/* Table Body */}
          <div className="space-y-3">
            {data.length === 0 ? (
              // Placeholder rows for empty state
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 items-center py-2"
                  >
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        R
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Ronald Richards
                        </div>
                        <div className="text-sm text-gray-500">
                          ronald.richards@example.com
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(
                        i === 1 ? "completed" : i === 2 ? "pending" : "new"
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-gray-900">
                      #{74568420 + i}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {i === 1
                        ? "3 min ago"
                        : i === 2
                        ? "5 min ago"
                        : "5 min ago"}
                    </div>
                    <div className="col-span-2 text-sm font-medium text-gray-900">
                      ${i === 1 ? "508.20" : i === 2 ? "250.00" : "864.00"}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Actual data rows
              data.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center py-2"
                >
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {item.customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="col-span-2 text-sm text-gray-900">
                    #{item.customerId}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {item.timeAgo}
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-900">
                    {item.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityTable;
