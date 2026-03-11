"use client";

import { useEffect, useState } from "react";
import {
  Gem, Package, ShoppingCart, TrendingUp, AlertTriangle,
  BookOpen, Loader2, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { formatINR, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "#10b981",
  IN_PROCESS: "#f59e0b",
  READY: "#3b82f6",
  PARTIALLY_SOLD: "#8b5cf6",
  CLOSED: "#6b7280",
  RETURNED: "#06b6d4",
  PENDING: "#f97316",
  CLOSED_RETURNED: "#ef4444",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusData = (stats?.subLotsByStatus || []).map((s: any) => ({
    name: getStatusLabel(s.status),
    value: s._count,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  const profit = (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0);

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-white mb-1" /> Inventory Dashboard
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Live overview of your gem inventory
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {/* Stat Cards */}
      <div className="row">
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <StatCard
            title="Total Lots"
            value={stats?.totalLots || 0}
            icon={<Package className="align-middle" />}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <StatCard
            title="Total Sub-Lots"
            value={stats?.totalSubLots || 0}
            icon={<Gem className="align-middle" />}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <StatCard
            title="Purchase Value"
            value={formatINR(stats?.totalPurchaseValue || 0)}
            icon={<ShoppingCart className="align-middle" />}
            color="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <StatCard
            title="Sales Value"
            value={formatINR(stats?.totalSaleValue || 0)}
            icon={<TrendingUp className="align-middle" />}
            color="info"
          />
        </div>
      </div>

      {/* Profit + Alerts Row */}
      {/* Profit + Alerts Row */}
      <div className="row">
        <div className="col-12 col-lg-4 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <h5 className="card-title mb-1">Net Profit / Loss</h5>
              <h1 className={`mt-1 mb-3 ${profit >= 0 ? "text-success" : "text-danger"}`}>
                {formatINR(profit)}
              </h1>
              <div className="mb-0">
                <span className={profit >= 0 ? "text-success" : "text-danger"}>
                  {profit >= 0 ? <ArrowUpRight className="align-middle me-1" /> : <ArrowDownRight className="align-middle me-1" />}
                  {profit >= 0 ? "Positive" : "Negative"} margin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <h5 className="card-title mb-1">Rejection Pending</h5>
              <h1 className="mt-1 mb-3 text-warning">{stats?.pendingRejections || 0}</h1>
              <div className="mb-0 text-warning">
                <AlertTriangle className="align-middle me-1" /> Requires attention
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <h5 className="card-title mb-1">Total Transactions</h5>
              <h1 className="mt-1 mb-3">{(stats?.totalPurchases || 0) + (stats?.totalSales || 0)}</h1>
              <div className="mb-0 text-muted">
                <Activity className="align-middle me-1" /> {stats?.totalPurchases} purchases &middot; {stats?.totalSales} sales
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row">
        {/* Pie Chart */}
        <div className="col-12 col-md-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Stock by Status</h5>
            </div>
            <div className="card-body d-flex">
              <div className="align-self-center w-100">
                {statusData.length > 0 ? (
                  <div className="py-3">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusData.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-muted">No data yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="col-12 col-md-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0"><BookOpen className="align-middle me-2" size={18} /> Recent Ledger Activity</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {(stats?.recentLedger || []).length === 0 ? (
                  <li className="list-group-item text-center text-muted">No activity yet</li>
                ) : (
                  (stats?.recentLedger || []).slice(0, 6).map((entry: any) => (
                    <li key={entry.id} className="list-group-item px-0 pb-2 mb-2 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{entry.lot?.lotNo || "—"}</strong>
                          <div className="text-muted small">
                            {entry.fromLocation} &rarr; {entry.toLocation}
                          </div>
                        </div>
                        <div className="text-end">
                          <div>{entry.weight} {entry.weightUnit}</div>
                          <div className="text-muted small">{formatDate(entry.createdAt)}</div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stock Summary */}
      <div className="row">
        <div className="col-12">
          <div className="card flex-fill">
            <div className="card-header">
              <h5 className="card-title mb-0"><Package className="align-middle me-2" size={18} /> Live Stock Summary</h5>
            </div>
            <table className="table table-hover my-0">
              <thead>
                <tr>
                  <th>Category / Status</th>
                  <th>Total Weight</th>
                  <th>Pieces</th>
                </tr>
              </thead>
              <tbody>
                {stats?.subLotsByStatus?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">No stock data available</td>
                  </tr>
                ) : (
                  stats?.subLotsByStatus?.map((s: any) => (
                    <tr key={s.status}>
                      <td>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: STATUS_COLORS[s.status] || "#94a3b8",
                          }}
                        >
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td><strong>{s._sum?.weight || 0}</strong> <span className="text-muted small ms-1">GM</span></td>
                      <td><strong>{s._sum?.pieces || 0}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "info" | "danger";
}) {
  return (
    <div className="card flex-fill">
      <div className="card-body">
        <div className="row">
          <div className="col mt-0">
            <h5 className="card-title">{title}</h5>
          </div>
          <div className="col-auto">
            <div className={`stat text-${color}`}>
              {icon}
            </div>
          </div>
        </div>
        <h1 className="mt-1 mb-3">{value}</h1>
      </div>
    </div>
  );
}
