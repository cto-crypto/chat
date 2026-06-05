"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BoroughData {
  borough: string | null;
  _count: { id: number };
}

interface BoroughChartProps {
  data: BoroughData[];
}

const BOROUGH_COLORS: Record<string, string> = {
  Bronx: "#4caf50",
  Brooklyn: "#2e7d32",
  Manhattan: "#66bb6a",
  Queens: "#388e3c",
  "Staten Island": "#81c784",
  Other: "#a5d6a7",
};

const FALLBACK_COLORS = ["#4caf50", "#2e7d32", "#66bb6a", "#388e3c", "#81c784", "#1a2b1a"];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{item.name}</p>
        <p className="text-lg font-bold text-[#4caf50]">{item.value} properties</p>
        <p className="text-xs text-gray-500">
          {(item.payload.percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function BoroughChart({ data }: BoroughChartProps) {
  const chartData = data.map((d) => ({
    name: d.borough ?? "Unknown",
    value: d._count.id,
  }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No property data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={95}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={BOROUGH_COLORS[entry.name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#4b5563", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
