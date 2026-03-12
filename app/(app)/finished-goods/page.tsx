"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Search, Loader2, Gem, Weight, Tag, Filter, Eye
} from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";

const CATEGORIES = ["", "ROUGH", "READY_GOODS", "BY_ORDER"] as const;
const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "READY", label: "Ready" },
  { value: "PARTIALLY_SOLD", label: "Partially Sold" },
  { value: "IN_STOCK", label: "In Stock" },
];

const STATUS_STYLE: Record<string, string> = {
  READY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PARTIALLY_SOLD: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  IN_STOCK: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

type SubLot = {
  id: string;
  subLotNo: string;
  lotId: string;
  status: string;
  weight: number;
  weightUnit: string;
  pieces: number | null;
  shape: string | null;
  size: string | null;
  lines: number | null;
  length: number | null;
  updatedAt: string;
  purchaseDate: string;
  purchasePrice: number;
  totalCost: number;
  rejectionWeight: number | null;
  rejectionPieces: number | null;
  rejectionStatus: string | null;
  lot: {
    lotNumber: string;
    itemName: string | null;
    category: string;
    supplierName: string | null;
    grossWeight: number;
    netWeight: number;
  };
  manufacturing: Array<{ totalManufacturingCost: number }>;
  sales: Array<{ finalBillAmount: number }>;
};

export default function FinishedGoodsPage() {
  const [items, setItems] = useState<SubLot[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<SubLot | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params = new URLSearchParams({ search, category, status });
      const r = await fetch(`/api/finished-goods?${params}`);
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        const msg = errorData.error || r.statusText;
        console.error("Failed to fetch finished goods:", msg);
        setApiError(msg);
        setItems([]);
      } else {
        const data = await r.json();
        if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
          setSummary(null);
        } else {
          setItems(data.subLots || []);
          setTotal(data.total || 0);
          setSummary(data.summary || null);
        }
      }
    } catch (err) {
      console.error("Error fetching finished goods:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <Gem className="w-5 h-5 text-white mb-1" /> Finished Goods
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            All products available for sale · {total} items
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Total Available</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-primary">
                    <Package className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.totalAvailable ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Ready</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-success">
                    <Gem className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.readyCount ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Partially Sold</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-warning">
                    <Tag className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.partiallySoldCount ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Total Weight (g)</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-danger">
                    <Weight className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.totalWeight != null ? summary.totalWeight.toFixed(2) : "—"}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row g-3 items-center">
            <div className="col-12 col-md-auto max-w-sm">
              <div className="input-group">
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lot no, item, shape..."
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-md-auto ms-auto d-flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select w-auto"
              >
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map((c) => (
                  <option key={c} value={c}>{getCategoryLabel(c)}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select w-auto"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="alert alert-danger shadow-sm border-0 rounded-4 mb-3">
          <strong>Database Error:</strong> {apiError}
        </div>
      )}

      {/* Table */}
      <div className="card flex-fill w-100">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Lot No</th>
                <th>Date</th>
                <th>Item / Category</th>
                <th>Supplier</th>
                <th>Selection Weight</th>
                <th>Pieces</th>
                <th>Shape</th>
                <th>Size</th>
                <th>Purchase Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-5">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-5 text-muted">
                    No lots found. Add a purchase to see inventory here.
                  </td>
                </tr>
              ) : (
                  items.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <td>
                      <a href={`/purchase/${item.id}`} className="font-monospace text-primary fw-bold text-decoration-none">
                        {item.lot?.lotNumber || "N/A"}
                      </a>
                    </td>
                    <td className="text-muted small text-nowrap">{formatDate(item.purchaseDate || item.updatedAt)}</td>
                    <td>
                      <p className="fw-medium small mb-0">{item.lot.itemName || "—"}</p>
                      <p className="small text-muted mb-0">
                        {getCategoryLabel(item.lot.category)}
                      </p>
                    </td>
                    <td className="text-muted">{item.lot.supplierName || "—"}</td>
                    <td className="fw-medium">
                      {item.weight != null ? item.weight.toFixed(3) : "—"}{" "}
                      <span className="small text-muted">{item.weightUnit}</span>
                    </td>
                    <td>{item.pieces ?? "—"}</td>
                    <td>{item.shape || "—"}</td>
                    <td>{item.size || "—"}</td>
                    <td className="fw-semibold text-amber-600">
                      {item.purchasePrice != null ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                        className="btn btn-sm btn-light"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-muted" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <ModalPortal>
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1} onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '100px', width: '92%', maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              {/* Drawer Header */}
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <div>
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2 m-0">
                    <Gem className="w-5 h-5 text-primary" />
                    {selected!.lot?.lotNumber || "N/A"}
                  </h5>
                  <p className="small text-muted mb-0 mt-1">
                    {selected!.lot?.itemName || "—"} · {getCategoryLabel(selected!.lot?.category || "")}
                  </p>
                </div>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.8rem', opacity: 0.6 }} onClick={() => setSelected(null)} aria-label="Close"></button>
              </div>

              {/* Drawer Body */}
              <div className="modal-body p-4 space-y-4">
                {/* Status */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span className="small text-muted">Lot Status:</span>
                  <span className={`badge ${getStatusColor(selected!.status)}`}>
                    {getStatusLabel(selected!.status)}
                  </span>
                </div>

                {/* Physical Details */}
                <div className="mb-4">
                  <p className="small fw-bold text-muted text-uppercase mb-2">Physical Details</p>
                  <div className="row g-3">
                    <div className="col-4"><DetailField label="Selection Weight" value={`${selected!.weight != null ? selected!.weight.toFixed(3) : "—"} ${selected!.weightUnit}`} /></div>
                    <div className="col-4"><DetailField label="Pieces" value={selected!.pieces ?? "—"} /></div>
                    <div className="col-4"><DetailField label="Shape" value={selected!.shape ?? "—"} /></div>
                    <div className="col-4"><DetailField label="Size" value={selected!.size ?? "—"} /></div>
                    <div className="col-4"><DetailField label="Lines" value={selected!.lines ?? "—"} /></div>
                    <div className="col-4"><DetailField label="Length" value={selected!.length ?? "—"} /></div>
                  </div>
                </div>

                {/* Financials */}
                <div className="mb-4">
                  <p className="small fw-bold text-muted text-uppercase mb-2">Financials</p>
                  <div className="row g-3">
                    <div className="col-6"><DetailField label="Purchase Price" value={selected!.purchasePrice != null ? `₹${selected!.purchasePrice.toLocaleString("en-IN")}` : "—"} /></div>
                    <div className="col-6"><DetailField label="Total Cost" value={selected!.totalCost != null ? `₹${selected!.totalCost.toLocaleString("en-IN")}` : "—"} /></div>
                  </div>
                </div>

                {/* Rejection */}
                {(selected!.rejectionWeight != null || selected!.rejectionPieces != null) && (
                  <div className="mb-4">
                    <p className="small fw-bold text-muted text-uppercase mb-2">Rejection Info</p>
                    <div className="row g-3">
                      <div className="col-4"><DetailField label="Rej. Weight" value={selected!.rejectionWeight != null ? `${selected!.rejectionWeight} ${selected!.weightUnit}` : "—"} /></div>
                      <div className="col-4"><DetailField label="Rej. Pieces" value={selected!.rejectionPieces ?? "—"} /></div>
                      <div className="col-4"><DetailField label="Rej. Status" value={selected!.rejectionStatus || "PENDING"} /></div>
                    </div>
                  </div>
                )}

                {/* Supplier */}
                <div className="mb-4">
                  <p className="small fw-bold text-muted text-uppercase mb-2">Source</p>
                  <div className="row g-3">
                    <div className="col-6"><DetailField label="Supplier" value={selected!.lot?.supplierName ?? "—"} /></div>
                    <div className="col-6"><DetailField label="Purchase Date" value={formatDate(selected!.purchaseDate || selected!.updatedAt)} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="bg-light rounded p-2 border">
      <p className="small text-muted mb-0">{label}</p>
      <p className="fw-medium mb-0">{value ?? "—"}</p>
    </div>
  );
}
