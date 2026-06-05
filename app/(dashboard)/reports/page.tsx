"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Download, TrendingUp, Home, FileText, Users, Calendar } from "lucide-react";
import { cn, formatCaseStatus, formatPropertyStatus, NYC_BOROUGHS } from "@/lib/utils";

const COLORS = ["#1a2b1a", "#4caf50", "#2e7d32", "#81c784", "#a5d6a7", "#c8e6c9", "#388e3c", "#66bb6a"];

interface ReportData {
  casesByStatus: Array<{ status: string; _count: { id: number } }>;
  propertiesByBorough: Array<{ borough: string; _count: { id: number } }>;
  voucherDistribution: Array<{ voucherSize: number | null; _count: { id: number } }>;
  housingCaseSummary: { total: number; housed: number; active: number; closed: number };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    // In production this fetches from /api/reports endpoint
    const mockData: ReportData = {
      casesByStatus: [
        { status: "NEW", _count: { id: 8 } },
        { status: "SEARCHING", _count: { id: 12 } },
        { status: "VIEWING_SCHEDULED", _count: { id: 6 } },
        { status: "APPLICATION_STARTED", _count: { id: 9 } },
        { status: "DOCUMENTS_NEEDED", _count: { id: 7 } },
        { status: "INSPECTION_PENDING", _count: { id: 5 } },
        { status: "APPROVED", _count: { id: 4 } },
        { status: "LEASE_SIGNING", _count: { id: 3 } },
        { status: "HOUSED", _count: { id: 18 } },
        { status: "CLOSED", _count: { id: 11 } },
      ],
      propertiesByBorough: [
        { borough: "Bronx", _count: { id: 8 } },
        { borough: "Brooklyn", _count: { id: 6 } },
        { borough: "Manhattan", _count: { id: 4 } },
        { borough: "Queens", _count: { id: 5 } },
        { borough: "Staten Island", _count: { id: 2 } },
      ],
      voucherDistribution: [
        { voucherSize: 1, _count: { id: 3 } },
        { voucherSize: 2, _count: { id: 5 } },
        { voucherSize: 3, _count: { id: 4 } },
        { voucherSize: 4, _count: { id: 2 } },
        { voucherSize: 5, _count: { id: 1 } },
      ],
      housingCaseSummary: { total: 83, housed: 18, active: 54, closed: 11 },
    };
    setData(mockData);
    setLoading(false);
  }, [dateFilter]);

  const monthlyHoused = [
    { month: "Jan", housed: 2 },
    { month: "Feb", housed: 3 },
    { month: "Mar", housed: 1 },
    { month: "Apr", housed: 4 },
    { month: "May", housed: 5 },
    { month: "Jun", housed: 3 },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Keev Housing Group performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <button className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Cases", value: data?.housingCaseSummary.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Families Housed", value: data?.housingCaseSummary.housed, icon: Home, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Cases", value: data?.housingCaseSummary.active, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Closed Cases", value: data?.housingCaseSummary.closed, icon: Calendar, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("inline-flex p-2 rounded-lg mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold text-[#1a2b1a]">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2b1a] mb-4">Cases by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.casesByStatus.map(d => ({ name: formatCaseStatus(d.status), count: d._count.id }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4caf50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Properties by Borough */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2b1a] mb-4">Properties by Borough</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data?.propertiesByBorough.map(d => ({ name: d.borough, value: d._count.id }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data?.propertiesByBorough.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Housing Trend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2b1a] mb-4">Families Housed by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyHoused}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="housed" stroke="#4caf50" strokeWidth={2} dot={{ fill: "#4caf50" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Voucher Size Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2b1a] mb-4">Voucher Size Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.voucherDistribution.map(d => ({ name: `${d.voucherSize}BR`, count: d._count.id }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a2b1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-[#1a2b1a] mb-4">Case Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                <th className="text-right py-2 text-gray-500 font-medium">Count</th>
                <th className="text-right py-2 text-gray-500 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.casesByStatus.map((row) => {
                const total = data.casesByStatus.reduce((sum, r) => sum + r._count.id, 0);
                const pct = ((row._count.id / total) * 100).toFixed(1);
                return (
                  <tr key={row.status} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-[#1a2b1a] font-medium">{formatCaseStatus(row.status)}</td>
                    <td className="py-2 text-right">{row._count.id}</td>
                    <td className="py-2 text-right text-gray-500">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
