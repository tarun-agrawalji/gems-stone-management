"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { formatINR, getStatusLabel } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const statusChartData = (stats?.subLotsByStatus || []).map((s: any) => ({
    name: getStatusLabel(s.status),
    Count: s._count,
  }));

  const summaryData = [
    { name: "Total Purchase Value", value: stats?.totalPurchaseValue || 0 },
    { name: "Total Sales Value", value: stats?.totalSaleValue || 0 },
    { name: "Net Profit", value: (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0) },
  ];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-white mb-1" /> Reports
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Financial and inventory analytics
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="row">
        {summaryData.map((item) => (
          <div key={item.name} className="col-12 col-md-4 d-flex">
            <div className={`card flex-fill border-start border-4 ${
              item.name === "Net Profit" ? (item.value >= 0 ? "border-success" : "border-danger") : "border-primary"
            }`}>
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0">
                    <h5 className="card-title text-muted text-uppercase mb-2">{item.name}</h5>
                  </div>
                </div>
                <h1 className={`mt-1 mb-2 font-monospace fw-bold ${
                  item.name === "Net Profit" ? (item.value >= 0 ? "text-success" : "text-danger") : "text-dark"
                }`}>
                  {formatINR(item.value)}
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="row">
        <div className="col-12 col-lg-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Stock Status Distribution</h5>
            </div>
            <div className="card-body d-flex w-100">
              <div className="align-self-center w-100">
                {statusChartData.length > 0 ? (
                  <div className="py-3">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusChartData} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} angle={-25} textAnchor="end" />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted text-center py-5">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0">System Summary</h5>
            </div>
            <div className="card-body pt-1">
              <table className="table">
                <tbody>
                  {[
                    { label: "Total Lots", value: stats?.totalLots || 0, unit: "lots" },
                    { label: "Total Sub-Lots", value: stats?.totalSubLots || 0, unit: "sub-lots" },
                    { label: "Total Purchases", value: stats?.totalPurchases || 0, unit: "records" },
                    { label: "Total Sales", value: stats?.totalSales || 0, unit: "records" },
                    { label: "Rejection Pending", value: stats?.pendingRejections || 0, unit: "items", highlight: true },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td><span className="text-muted">{row.label}</span></td>
                      <td className="text-end">
                        <span className={`fw-bold ${row.highlight ? "text-warning" : "text-dark"}`}>
                          {row.value}
                        </span> 
                        <span className="text-muted small ms-1">{row.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
