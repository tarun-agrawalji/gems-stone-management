"use client";

import { useState, useEffect, useCallback, use } from "react";
import { 
  AlertTriangle, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Trash, 
  CheckCircle2, 
  Scale, 
  Package, 
  Layers, 
  User, 
  Info,
  History,
  Tag,
  ChevronRight,
  Edit3,
  Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface RejectionDetailProps {
  params: Promise<{ type: string; id: string }>;
}

export default function RejectionDetailPage({ params }: RejectionDetailProps) {
  const { type, id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const r = await fetch(`/api/rejection-item/${type}/${id}`);
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Rejection not found");
      setData(json);
      setStatus(json.status || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const r = await fetch(`/api/rejection-item/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Failed to update");
      setIsEditMode(false);
      fetchDetail();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this rejection entry?")) return;
    try {
      setSaving(true);
      const r = await fetch(`/api/rejection-item/${type}/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Failed to delete");
      window.location.href = "/rejection";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-muted fw-medium">Loading details...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="container py-5">
      <div className="alert alert-danger shadow-sm border-0 rounded-4">
        {error || "Item not found"}
      </div>
    </div>
  );

  const STATUS_OPTIONS = type === "purchase" 
    ? ["PENDING", "RETURNED", "RESELLABLE", "CLOSED"]
    : type === "manufacturing"
      ? ["REJECTED", "RETURNED_TO_MANUFACTURER", "COMPLETED"]
      : ["RETURNED", "CLOSED"];

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5">
      {/* Premium Breadcrumb/Header - Blended with global hero */}
      <div className="pb-5 pt-4 px-4" style={{ zIndex: 100 }}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-2">
          <div className="d-flex align-items-center gap-4">
            <Link href="/rejection" className="btn btn-white bg-white bg-opacity-10 shadow-sm rounded-4 p-3 border border-white border-opacity-25 transition-all hover-bg-opacity-20 hover-translate-y">
              <ArrowLeft className="text-white" size={24} />
            </Link>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-3 py-2 rounded-pill font-mono shadow-sm uppercase">
                  {type} Rejection
                </span>
                <ChevronRight className="text-white text-opacity-50" size={16} />
                <span className="text-white text-opacity-75 small fw-medium">Lot #{data.lotNo}</span>
              </div>
              <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-sm">
                Lot #{data.lotNo || "N/A"} {loading && "..."}
              </h3>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
             <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`btn ${isEditMode ? 'btn-white text-primary' : 'bg-white bg-opacity-10 text-white'} d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm fw-bold border border-white border-opacity-25 transition-all`}
              >
                <Edit3 size={18} />
                {isEditMode ? "Cancel Edit" : "Edit Entry"}
              </button>

             <button 
                onClick={handleUpdate}
                disabled={saving || !isEditMode}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-primary-sm fw-bold border-0 transition-all hover-scale"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving..." : "Update Action"}
              </button>

              <button 
                onClick={handleDelete}
                disabled={saving}
                className="btn btn-link text-white text-opacity-75 hover-text-danger transition-all d-flex align-items-center gap-2 text-decoration-none"
              >
                <Trash2 size={18} />
                <span className="small fw-bold uppercase px-1">Remove</span>
              </button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4" style={{ position: "relative", zIndex: 10 }}>
        <div className="row g-4">
          {/* Main Context Card */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-premium rounded-5 bg-white mb-4 overflow-hidden">
              <div className="card-body p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-primary-subtle rounded-4 text-primary shadow-sm">
                    <Package size={24} />
                  </div>
                  <h4 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Primary Record</h4>
                </div>

                <div className="row g-5">
                  <div className="col-md-6">
                    <ModernField label="Reference Name" value={data.supplierName || data.soldTo || data.reason || "—"} icon={<User size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Item / Type" value={data.itemName || type} icon={<Tag size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Transaction Date" value={formatDate(data.date)} icon={<History size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Status" icon={<AlertTriangle size={18} />}>
                      {isEditMode ? (
                        <select 
                          value={status} 
                          onChange={(e) => setStatus(e.target.value)}
                          className="form-select border-primary-subtle bg-white rounded-3 fw-bold text-primary shadow-sm"
                        >
                          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                        </select>
                      ) : (
                        <div className="fw-extrabold text-dark fs-5">{status.replace(/_/g, " ")}</div>
                      )}
                    </ModernField>
                  </div>
                </div>

                {data.memo && (
                  <div className="mt-5 p-4 bg-light rounded-4 border-start border-primary border-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                       <Info className="text-primary" size={16} />
                       <span className="small fw-bold text-primary uppercase tracking-widest">Memo / Notes</span>
                    </div>
                    <p className="m-0 text-muted-800 fst-italic">{data.memo}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-12">
                <div className="card h-100 border-0 shadow-premium rounded-5 bg-rose-subtle-25">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="p-2 bg-rose rounded-3 text-white shadow-sm">
                        <Trash size={18} />
                      </div>
                      <h6 className="m-0 fw-bold uppercase text-rose tracking-wider">Rejected Metrics</h6>
                    </div>
                    <div className="row g-4">
                      <div className="col-6">
                        <ModernSmallField label="Weight" value={data.rejectionWeight || data.returnedWeight || 0} unit={data.weightUnit} accent="rose" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Pieces" value={data.rejectionPieces || data.returnedPieces || "—"} accent="rose" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Lines" value={data.rejectionLines || data.returnedLines || "—"} accent="rose" />
                      </div>
                      {type === "purchase" && (
                        <div className="col-6">
                          <ModernSmallField label="Return Date" value={data.rejectionDate ? formatDate(data.rejectionDate) : "—"} accent="rose" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-premium rounded-5 bg-dark text-white overflow-hidden sticky-top" style={{ top: '2rem' }}>
              <div className="bg-primary-gradient p-4 text-center">
                <div className="small font-mono opacity-75 uppercase mb-2 tracking-widest">Inventory Impact</div>
                <div className="h4 fw-extrabold m-0 text-white letter-tight">
                  Lot #{data.lotNo}
                </div>
              </div>
              <div className="card-body p-4">
                <div className="space-y-4">
                  {type === "purchase" && (
                     <>
                        <ModernStatRow label="Gross Weight" value={`${data.grossWeight} ${data.weightUnit}`} />
                        <ModernStatRow label="Less Weight" value={`${data.lessWeight} ${data.weightUnit}`} color="text-rose" />
                     </>
                  )}
                  {data.netSale && (
                     <ModernStatRow label="Original Sale Value" value={`₹${data.netSale.toLocaleString()}`} color="text-warning" isLarge />
                  )}
                  
                  <div className="alert bg-warning bg-opacity-10 border-0 rounded-4 text-warning mt-4 mb-0">
                    <div className="d-flex align-items-start gap-3">
                      <Info size={20} className="mt-1 flex-shrink-0" />
                      <div className="small lh-sm">
                        <strong className="d-block mb-1 tracking-widest uppercase fs-xs">Status Update Impact</strong>
                        Changing the status to <strong>RETURNED</strong> will mark this item for PHYSICAL shipment back to the origin.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-navy { background-color: #0f172a !important; }
        .text-navy { color: #0f172a !important; }
        .shadow-premium { box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
        .shadow-primary-sm { box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.39); }
        .bg-rose-subtle-25 { background-color: rgba(244, 63, 94, 0.05); }
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
      `}</style>
    </div>
  );
}

function ModernField({ label, value, icon, children }: any) {
  return (
    <div className="mb-2">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-wider uppercase opacity-80">
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children || <div className="fw-extrabold text-navy fs-4">{value}</div>}
    </div>
  );
}

function ModernSmallField({ label, value, unit, accent }: any) {
  const textColorClass = accent === 'rose' ? 'text-rose' : 'text-primary';
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm h-100 border border-light transition-all hover-translate-y">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2 font-mono" style={{ fontSize: '0.65rem' }}>{label}</div>
      <div className={`fw-extrabold fs-5 ${textColorClass}`}>
        {value || "0"}
        {unit && <span className="small opacity-50 fw-medium ms-1">{unit}</span>}
      </div>
    </div>
  );
}

function ModernStatRow({ label, value, color = "text-white", isLarge = false }: any) {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10 pb-3 mb-3">
      <span className="small opacity-75 fw-medium">{label}</span>
      <span className={`fw-bold font-mono ${isLarge ? 'fs-4' : 'fs-5'} ${color}`}>{value}</span>
    </div>
  );
}

function ModernBadgeStat({ label, value, icon, color = "primary" }: any) {
  return (
    <div className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color} border-opacity-25 px-3 py-2 rounded-pill font-mono shadow-sm uppercase d-flex align-items-center gap-2`}>
      {icon}
      <span>{label}: {value}</span>
    </div>
  );
}

function MetricCard({ label, value, unit, accent }: any) {
  return (
    <div className="col-6 col-md-3">
      <div className={`p-4 rounded-5 border-0 bg-white text-center shadow-sm h-100`}>
        <div className="small text-muted fw-bold uppercase tracking-tighter mb-1">{label}</div>
        <div className={`h4 fw-extrabold m-0 text-${accent}`}>
          {value} {unit && <span className="small fw-medium opacity-50">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
