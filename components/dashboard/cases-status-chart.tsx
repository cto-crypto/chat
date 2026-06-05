"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCaseStatus } from "@/lib/utils";

interface CaseStatusData {
  status: string;
  _count: { id: number };
}

interface CasesStatusChartProps {
  data: CaseStatusData[];
}

const BAR_COLORS = [
  "#4caf50",
  "#2e7d32",
  "#66bb6a",
  "#388e3c",
  "#81c784",
  "#1b5e20",
  "#a5d6a7",
  "#43a047",
  "#c8e6c9",
  "#1a2b1a",
  "#2e7d32",
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-lg font-bold text-[#4caf50]">{payload[0].value} cases</p>
      </div>
    );
  }
  return null;
};

export function CasesStatusChart({ data }: CasesStatusChartProps) {
  const chartData = data.map((d) => ({
    status: formatCaseStatus(d.status),
    count: d._count.id,
    rawStatus: d.status,
  }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No case data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="status"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
