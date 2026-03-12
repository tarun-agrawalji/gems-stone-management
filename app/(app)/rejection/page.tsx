"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Search, Loader2, CheckCircle, Clock, RotateCcw, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Tab = "purchase" | "manufacturing" | "sales";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <Clock className="w-3 h-3" /> },
  RETURNED: { label: "Returned", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: <RotateCcw className="w-3 h-3" /> },
  RESELLABLE: { label: "Resellable", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle className="w-3 h-3" /> },
  CLOSED: { label: "Closed", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <XCircle className="w-3 h-3" /> },
  REJECTED: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
  RETURNED_TO_MANUFACTURER: { label: "Returned to Mfr.", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: <RotateCcw className="w-3 h-3" /> },
  PARTIALLY_RETURNED: { label: "Partially Returned", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <RotateCcw className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "bg-gray-500/20 text-gray-400", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function RejectionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("purchase");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const r = await fetch(`/api/rejection?${params}`);
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        console.error("[Rejection] API error:", err);
        setData(null);
      } else {
        const json = await r.json();
        setData(json);
      }
    } catch (err) {
      console.error("[Rejection] Fetch error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search]);


  useEffect(() => { fetchData(); }, [fetchData]);

  async function updateStatus(recordType: "purchase" | "manufacturing", id: string, status: string) {
    setUpdating(id);
    await fetch("/api/rejection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordType, id, status }),
    });
    setUpdating(null);
    fetchData();
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "purchase", label: "Purchase Rejections", count: data?.summary?.purchasePending },
    { key: "manufacturing", label: "Manufacturing Rejections", count: data?.summary?.mfgPending },
    { key: "sales", label: "Sales Returns", count: data?.summary?.salesReturnCount },
  ];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning mb-1" /> Rejections
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Purchase rejections, manufacturing rejections & customer returns
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-12 col-sm-6 col-xxl-4 d-flex">
          <SummaryCard
            label="Purchase Pending"
            value={data?.summary?.purchasePending ?? "—"}
            color="warning"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>
        <div className="col-12 col-sm-6 col-xxl-4 d-flex">
          <SummaryCard
            label="Manufacturing Pending"
            value={data?.summary?.mfgPending ?? "—"}
            color="danger"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>
        <div className="col-12 col-sm-6 col-xxl-4 d-flex">
          <SummaryCard
            label="Sales Returns"
            value={data?.summary?.salesReturnCount ?? "—"}
            color="info"
            icon={<RotateCcw className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="btn-group shadow-sm bg-white rounded" role="group">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              type="button"
              className={`btn ${activeTab === t.key
                  ? "btn-primary"
                  : "btn-outline-primary border-0"
                } d-flex align-items-center gap-2 px-4 py-2`}
            >
              {t.label}
              {(t.count ?? 0) > 0 && (
                <span className={`badge rounded-pill ${activeTab === t.key ? "bg-white text-primary" : "bg-warning text-dark"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text"><Search className="w-4 h-4" /></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lot no, supplier, item..."
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card flex-fill w-100">
        <div className="table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </div>
          ) : activeTab === "purchase" ? (
            <PurchaseTable
              rows={data?.purchaseRejections || []}
            />
          ) : activeTab === "manufacturing" ? (
            <ManufacturingTable
              rows={data?.manufacturingRejections || []}
            />
          ) : (
            <SalesReturnTable rows={data?.salesReturns || []} />
          )}
        </div>
      </div>
    </div>
  );
}

function PurchaseTable({ rows }: { rows: any[] }) {
  return (
    <table className="table table-hover my-0">
      <thead>
        <tr>
          <th>Lot No</th><th>Date</th><th>Supplier</th><th>Item</th>
          <th>Rej. Weight</th><th>Rej. Pieces</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={7} className="text-center py-5 text-muted">No purchase rejections found.</td></tr>
        ) : rows.map((p: any) => (
          <tr key={p.id}>
            <td>
              <Link href={`/rejection/purchase/${p.id}`} className="font-monospace text-primary fw-bold hover:underline">
                {p.lot?.lotNumber || p.lot?.lotNo || "—"}
              </Link>
            </td>
            <td>{formatDate(p.date)}</td>
            <td>{p.supplierName || "—"}</td>
            <td>{p.itemName || "—"}</td>
            <td>{p.rejectionWeight != null ? `${p.rejectionWeight} ${p.weightUnit || "G"}` : "—"}</td>
            <td>{p.rejectionPieces ?? "—"}</td>
            <td><StatusBadge status={p.rejectionStatus || "PENDING"} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


function ManufacturingTable({ rows }: { rows: any[] }) {
  return (
    <table className="table table-hover my-0">
      <thead>
        <tr>
          <th>Lot No</th><th>Date</th><th>Reason / Item</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={4} className="text-center py-5 text-muted">No manufacturing rejections found.</td></tr>
        ) : rows.map((m: any) => (
          <tr key={m.id}>
            <td>
              <Link href={`/rejection/manufacturing/${m.id}`} className="font-monospace text-primary fw-bold hover:underline">
                {m.lot?.lotNo || m.lot?.lotNumber || "—"}
              </Link>
            </td>
            <td>{formatDate(m.date)}</td>
            <td>{m.reason || "Manufacturing Reject"}</td>
            <td><StatusBadge status={m.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SalesReturnTable({ rows }: { rows: any[] }) {
  return (
    <table className="table table-hover my-0">
      <thead>
        <tr>
          <th>Lot No</th><th>Date</th><th>Sold To</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={4} className="text-center py-5 text-muted">No sales returns found.</td></tr>
        ) : rows.map((s: any) => (
          <tr key={s.id}>
            <td>
              <Link href={`/rejection/sales/${s.id}`} className="font-monospace text-primary fw-bold hover:underline">
                {s.lot?.lotNo || s.lot?.lotNumber || "—"}
              </Link>
            </td>
            <td>{formatDate(s.date)}</td>
            <td>{s.soldTo || "—"}</td>
            <td><StatusBadge status={s.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SummaryCard({
  label, value, color, icon,
}: {
  label: string;
  value: number | string;
  color: "warning" | "danger" | "info";
  icon: React.ReactNode;
}) {
  const colorMap = {
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  };
  return (
    <div className="card flex-fill">
      <div className="card-body">
        <div className="row">
          <div className="col mt-0">
            <h5 className="card-title">{label}</h5>
          </div>
          <div className="col-auto">
            <div className={`stat ${colorMap[color]}`}>
              {icon}
            </div>
          </div>
        </div>
        <h1 className="mt-1 mb-3">{value}</h1>
      </div>
    </div>
  );
}
