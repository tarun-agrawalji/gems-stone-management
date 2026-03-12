"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Save, Trash2, 
  Loader2, AlertCircle, CheckCircle2,
  Calendar, Package, User, Hash,
  Scale, Layers, Ruler, Box,
  DollarSign, Info, Trash, ChevronRight
} from "lucide-react";
import { formatINR, formatDate, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";

const WEIGHT_UNITS = ["G", "KG", "CT"];
const CATEGORIES = ["ROUGH", "READY_GOODS", "BY_ORDER"];

interface Params {
  id: string;
}

export default function PurchaseDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [form, setForm] = useState({
    lotNo: "", date: "", itemName: "", category: "ROUGH",
    supplierName: "", descriptionRef: "", 
    grossWeight: "", lessWeight: "0", weightUnit: "G", size: "", shape: "", lines: "", lineLength: "", pieces: "",
    selectionWeight: "", selectionPieces: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "", rejectionDate: "", rejectionStatus: "PENDING",
    purchasePrice: "",
  });

  useEffect(() => {
    async function fetchPurchase() {
      try {
        setLoading(true);
        const r = await fetch(`/api/purchase/${id}`);
        if (!r.ok) throw new Error("Failed to fetch purchase");
        const data = await r.json();
        
        // Compute net weight (gross - less)
        const netWt = (data.grossWeight || 0) - (data.lessWeight || 0);
        const rejWt = data.rejectionWeight || 0;
        const rejPc = data.rejectionPieces || 0;
        const rejLn = data.rejectionLines || 0;
        const rejLen = data.rejectionLength || 0;
        const totalPc = data.pieces || 0;
        const totalLn = data.lines || 0;
        const totalLen = data.lineLength || 0;

        // Selection = Total - Rejection (since these fields are not stored in DB)
        const selWt = Math.max(0, netWt - rejWt);
        const selPc = Math.max(0, totalPc - rejPc);
        const selLn = Math.max(0, totalLn - rejLn);
        const selLen = Math.max(0, totalLen - rejLen);

        setForm({
          lotNo: data.lot?.lotNumber || "",
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
          itemName: data.itemName || "",
          category: data.lot?.category || "ROUGH",
          supplierName: data.supplier || "",
          descriptionRef: data.descriptionRef || "",
          grossWeight: data.grossWeight?.toString() || "",
          lessWeight: data.lessWeight?.toString() || "0",
          weightUnit: data.weightUnit || "G",
          size: data.size || "",
          shape: data.shape || "",
          pieces: data.pieces?.toString() || "",
          lines: data.lines?.toString() || "",
          lineLength: data.lineLength?.toString() || "",
          selectionWeight: selWt > 0 ? selWt.toFixed(3) : "",
          selectionPieces: selPc > 0 ? selPc.toString() : "",
          selectionLines: selLn > 0 ? selLn.toString() : "",
          selectionLength: selLen > 0 ? selLen.toFixed(2) : "",
          rejectionWeight: data.rejectionWeight?.toString() || "",
          rejectionPieces: data.rejectionPieces?.toString() || "",
          rejectionLines: data.rejectionLines?.toString() || "",
          rejectionLength: data.rejectionLength?.toString() || "",
          rejectionDate: data.rejectionDate ? new Date(data.rejectionDate).toISOString().split('T')[0] : "",
          rejectionStatus: data.rejectionStatus || "PENDING",
          purchasePrice: data.purchasePrice?.toString() || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchase();
  }, [id]);

  const num = (v: string) => parseFloat(v || "0");
  const netWeight = num(form.grossWeight) - num(form.lessWeight);
  const netPieces = parseInt(form.pieces || "0");
  const netLines = parseInt(form.lines || "0");
  const costPerGram = netWeight > 0 ? num(form.purchasePrice) / netWeight : 0;

  const f = (k: string, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      
      // Auto-fill rejection based on selection
      if (k === "selectionWeight" || k === "grossWeight" || k === "lessWeight") {
        const nw = parseFloat(next.grossWeight || "0") - parseFloat(next.lessWeight || "0");
        const sw = parseFloat(next.selectionWeight || "0");
        if (sw <= nw) {
          next.rejectionWeight = (nw - sw).toFixed(3);
        }
      }
      
      if (k === "selectionPieces" || k === "pieces") {
        const np = parseInt(next.pieces || "0");
        const sp = parseInt(next.selectionPieces || "0");
        if (sp <= np) {
          next.rejectionPieces = (np - sp).toString();
        }
      }

      if (k === "selectionLines" || k === "lines") {
        const nl = parseInt(next.lines || "0");
        const sl = parseInt(next.selectionLines || "0");
        if (sl <= nl) {
          next.rejectionLines = (nl - sl).toString();
        }
      }

      return next;
    });
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    
    try {
      const r = await fetch(`/api/purchase/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grossWeight: parseFloat(form.grossWeight),
          lessWeight: parseFloat(form.lessWeight || "0"),
          lines: form.lines ? parseInt(form.lines) : undefined,
          lineLength: form.lineLength ? parseFloat(form.lineLength) : undefined,
          pieces: form.pieces ? parseInt(form.pieces) : undefined,
          purchasePrice: parseFloat(form.purchasePrice),
          selectionWeight: form.selectionWeight ? parseFloat(form.selectionWeight) : undefined,
          selectionPieces: form.selectionPieces ? parseInt(form.selectionPieces) : undefined,
          selectionLines: form.selectionLines ? parseInt(form.selectionLines) : undefined,
          selectionLength: form.selectionLength ? parseFloat(form.selectionLength) : undefined,
          rejectionWeight: form.rejectionWeight ? parseFloat(form.rejectionWeight) : undefined,
          rejectionPieces: form.rejectionPieces ? parseInt(form.rejectionPieces) : undefined,
          rejectionLines: form.rejectionLines ? parseInt(form.rejectionLines) : undefined,
          rejectionLength: form.rejectionLength ? parseFloat(form.rejectionLength) : undefined,
          rejectionDate: form.rejectionDate || null,
          rejectionStatus: form.rejectionStatus || "PENDING",
          supplierName: form.supplierName,
        }),
      });
      
      if (!r.ok) {
        const errBody = await r.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to update purchase");
      }
      
      setSuccess("Purchase updated successfully!");
      setIsEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this purchase? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const r = await fetch(`/api/purchase/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete purchase");
      router.push("/purchase");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5">
      {/* Premium Breadcrumb/Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-2">
        <div className="d-flex align-items-center gap-4">
          <Link href="/purchase" className="btn btn-white bg-white bg-opacity-10 shadow-sm rounded-4 p-3 border border-white border-opacity-25 transition-all hover-bg-opacity-20 hover-translate-y">
            <ArrowLeft className="text-white" size={24} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-3 py-2 rounded-pill font-mono shadow-sm">
                {form.lotNo}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={16} />
              <span className="text-white text-opacity-75 small fw-medium">Purchase Detail</span>
            </div>
            <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-sm">
              {form.itemName || "Item Details"}
            </h3>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {!isEditMode ? (
            <>
              <button 
                onClick={() => setIsEditMode(true)}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-primary-sm fw-bold border-0 transition-all hover-scale"
              >
                <Edit size={18} /> Edit Entry
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-white text-danger d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm border-0 transition-all hover-bg-danger-subtle"
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} 
                <span className="fw-semibold">Remove</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditMode(false)}
                className="btn btn-link text-secondary text-decoration-none px-4 fw-bold"
              >
                Discard Changes
              </button>
              <button 
                type="submit" 
                form="detailForm"
                disabled={saving}
                className="btn btn-indigo d-flex align-items-center gap-2 px-5 py-3 rounded-4 shadow-indigo-sm border-0 transition-all"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                <span className="fw-bold">Apply Updates</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3 mb-5 mx-4 fade show">
          <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="fw-bold">Action Required</div>
            <div className="small opacity-75">{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3 mb-5 mx-4 fade show">
          <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="fw-bold">Success</div>
            <div className="small opacity-75">{success}</div>
          </div>
        </div>
      )}

      <form id="detailForm" onSubmit={handleUpdate} className="px-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-premium rounded-5 overflow-hidden mb-4 bg-white">
              <div className="card-body p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-primary-subtle rounded-4 text-primary shadow-sm">
                    <Info size={24} />
                  </div>
                  <h4 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Entry Metadata</h4>
                </div>

                <div className="row g-5">
                  <div className="col-md-6">
                    <Field label="Lot Identifier" icon={<Hash size={18} />}>
                      <input 
                        readOnly={!isEditMode}
                        value={form.lotNo} 
                        onChange={(e) => f("lotNo", e.target.value)} 
                        className={`form-control-minimal fw-bold fs-5 ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Transaction Date" icon={<Calendar size={18} />}>
                      <input 
                        type={isEditMode ? "date" : "text"}
                        readOnly={!isEditMode}
                        value={form.date} 
                        onChange={(e) => f("date", e.target.value)} 
                        className={`form-control-minimal fw-semibold ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Categorization" icon={<Layers size={18} />}>
                      {isEditMode ? (
                        <select 
                          value={form.category} 
                          onChange={(e) => f("category", e.target.value)} 
                          className="form-select form-control-edit fw-semibold"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                        </select>
                      ) : (
                        <div className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-3 fw-bold">
                          {getCategoryLabel(form.category)}
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Originating Supplier" icon={<User size={18} />}>
                      <input 
                        readOnly={!isEditMode}
                        value={form.supplierName} 
                        onChange={(e) => f("supplierName", e.target.value)} 
                        className={`form-control-minimal text-dark fw-medium ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                  <div className="col-12">
                    <Field label="Memo / References" icon={<Info size={18} />}>
                      <textarea 
                        readOnly={!isEditMode}
                        rows={3}
                        value={form.descriptionRef} 
                        onChange={(e) => f("descriptionRef", e.target.value)} 
                        className={`form-control-minimal text-muted-800 ${isEditMode ? 'form-control-edit' : ''}`} 
                        placeholder="..."
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-premium rounded-5 bg-emerald-subtle-25">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald rounded-3 text-white shadow-sm">
                        <CheckCircle2 size={18} />
                      </div>
                      <h6 className="m-0 fw-bold uppercase text-emerald tracking-wider">Quality Selection</h6>
                    </div>
                    <div className="row g-4">
                      <div className="col-6">
                        <ModernSmallField label="Weight" value={form.selectionWeight} unit={form.weightUnit} isEdit={isEditMode} onChange={(v) => f("selectionWeight", v)} accent="emerald" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Pieces" value={form.selectionPieces} isEdit={isEditMode} onChange={(v) => f("selectionPieces", v)} accent="emerald" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Strands" value={form.selectionLines} isEdit={isEditMode} onChange={(v) => f("selectionLines", v)} accent="emerald" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Total L." value={form.selectionLength} isEdit={isEditMode} onChange={(v) => f("selectionLength", v)} accent="emerald" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-premium rounded-5 bg-rose-subtle-25">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="p-2 bg-rose rounded-3 text-white shadow-sm">
                        <Trash size={18} />
                      </div>
                      <h6 className="m-0 fw-bold uppercase text-rose tracking-wider">QC Rejection</h6>
                    </div>
                    <div className="row g-4">
                      <div className="col-6">
                        <ModernSmallField label="Weight" value={form.rejectionWeight} unit={form.weightUnit} isEdit={isEditMode} onChange={(v) => f("rejectionWeight", v)} accent="rose" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Pieces" value={form.rejectionPieces} isEdit={isEditMode} onChange={(v) => f("rejectionPieces", v)} accent="rose" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Strands" value={form.rejectionLines} isEdit={isEditMode} onChange={(v) => f("rejectionLines", v)} accent="rose" />
                      </div>
                      <div className="col-6">
                        <ModernSmallField label="Total L." value={form.rejectionLength} isEdit={isEditMode} onChange={(v) => f("rejectionLength", v)} accent="rose" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-premium rounded-5 bg-white mb-4 overflow-hidden">
               <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-subtle rounded-3 text-indigo shadow-sm">
                    <Scale size={20} />
                  </div>
                  <h6 className="fw-extrabold m-0 text-navy uppercase tracking-wider">Metrics & Specs</h6>
                </div>
                
                <div className="space-y-4">
                  <ModernStatRow label="Gross Load" value={parseFloat(form.grossWeight || "0").toFixed(3)} unit={form.weightUnit} isEdit={isEditMode} field="grossWeight" onChange={f} />
                  <ModernStatRow label="Loss Factor" value={parseFloat(form.lessWeight || "0").toFixed(3)} unit={form.weightUnit} isEdit={isEditMode} field="lessWeight" onChange={f} />
                  
                  <div className="p-4 bg-primary rounded-4 text-white text-center shadow-primary-sm my-4">
                    <div className="small opacity-75 uppercase mb-1 fw-bold tracking-widest">Calculated Net Yield</div>
                    <div className="h3 fw-extrabold m-0">{netWeight.toFixed(3)} <span className="small fw-medium opacity-75">{form.weightUnit}</span></div>
                  </div>

                  <hr className="border-secondary opacity-25" />
                  <div className="row g-3">
                    <div className="col-6">
                      <ModernBadgeStat label="Size" value={form.size} isEdit={isEditMode} field="size" onChange={f} />
                    </div>
                    <div className="col-6">
                      <ModernBadgeStat label="Form" value={form.shape} isEdit={isEditMode} field="shape" onChange={f} />
                    </div>
                    <div className="col-6">
                      <ModernBadgeStat label="Count" value={form.pieces} isEdit={isEditMode} field="pieces" onChange={f} />
                    </div>
                    <div className="col-6">
                      <ModernBadgeStat label="Lines" value={form.lines} isEdit={isEditMode} field="lines" onChange={f} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-premium rounded-5 bg-dark text-white overflow-hidden sticky-top" style={{ top: '2rem' }}>
              <div className="bg-primary-gradient p-4 text-center">
                <div className="small font-mono opacity-75 uppercase mb-2 tracking-widest">Financial Audit</div>
                {isEditMode ? (
                    <div className="input-group input-group-lg">
                      <span className="input-group-text border-0 bg-white bg-opacity-10 text-white">₹</span>
                      <input 
                        type="number"
                        className="form-control text-center bg-white bg-opacity-10 border-0 text-white fw-extrabold"
                        value={form.purchasePrice}
                        onChange={(e) => f("purchasePrice", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="h1 fw-extrabold text-amber-500 m-0 letter-tight">{formatINR(num(form.purchasePrice))}</div>
                  )}
              </div>
              <div className="card-body p-4 bg-navy">
                <div className="space-y-3">
                  <div className="d-flex justify-content-between align-items-center opacity-80">
                    <span className="small fw-semibold">Net Material</span>
                    <span className="fw-mono">{netWeight.toFixed(3)} {form.weightUnit}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-top border-white border-opacity-10 pt-3">
                    <span className="small fw-semibold text-primary">Unit Acquisition Cost</span>
                    <span className="fw-bold fs-5 text-white">{formatINR(costPerGram)}<span className="small opacity-50 fw-normal">/g</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .bg-light { background-color: #f8fafc !important; }
        .text-navy { color: #0f172a !important; }
        .text-emerald { color: #10b981 !important; }
        .bg-emerald { background-color: #10b981 !important; }
        .bg-emerald-subtle-25 { background-color: rgba(16, 185, 129, 0.04) !important; }
        .text-rose { color: #f43f5e !important; }
        .bg-rose { background-color: #f43f5e !important; }
        .bg-rose-subtle-25 { background-color: rgba(244, 63, 94, 0.04) !important; }
        .bg-navy { background-color: #0f172a !important; }
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
        .btn-indigo { background-color: #4f46e5; color: white; }
        .btn-indigo:hover { background-color: #4338ca; color: white; transform: translateY(-2px); }
        .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.02) !important; }
        .shadow-primary-sm { box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3) !important; }
        .shadow-indigo-sm { box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3) !important; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .letter-tight { letter-spacing: -0.025em; }
        .form-control-minimal { background: transparent; border: none; padding: 0.5rem 0; color: #1e293b; width: 100%; transition: all 0.2s; }
        .form-control-minimal:focus { outline: none; }
        .form-control-edit { background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 0.75rem 1rem !important; border-radius: 12px !important; }
        .form-control-edit:focus { background: white !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }
        .hover-translate-y:hover { transform: translateY(-3px); }
        .hover-scale:hover { transform: scale(1.05); }
        .rounded-5 { border-radius: 2rem !important; }
        .rounded-4 { border-radius: 1rem !important; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .fw-extrabold { font-weight: 800; }
        .text-amber-500 { color: #f59e0b !important; }
      `}</style>
    </div>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="mb-2">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-wider uppercase opacity-80">
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

function ModernStatRow({ label, value, unit, isEdit, field, onChange }: { label: string; value: string; unit: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2">
      <span className="text-secondary fw-semibold small">{label}</span>
      {isEdit ? (
        <div className="input-group input-group-sm w-50">
          <input 
            type="number" 
            className="form-control bg-light border-secondary-subtle px-3" 
            value={value} 
            onChange={(e) => onChange(field, e.target.value)} 
          />
          <span className="input-group-text bg-white border-secondary-subtle font-mono small">{unit}</span>
        </div>
      ) : (
        <span className="text-navy fw-extrabold fs-5">{value} <span className="small fw-medium text-muted opacity-50">{unit}</span></span>
      )}
    </div>
  );
}

function ModernBadgeStat({ label, value, isEdit, field, onChange }: { label: string; value: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="bg-light p-3 rounded-4 transition-all hover-translate-y h-100 shadow-sm border border-light">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>{label}</div>
      {isEdit ? (
        <input 
          className="form-control form-control-sm bg-white border-0 border-bottom border-primary-subtle text-navy p-0 rounded-0 fw-bold"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      ) : (
        <div className="text-navy fw-extrabold">{value || "—"}</div>
      )}
    </div>
  );
}

function ModernSmallField({ label, value, unit, isEdit, onChange, accent }: { label: string; value: string; unit?: string; isEdit: boolean; onChange: (v: string) => void; accent: 'emerald' | 'rose' }) {
  const textColorClass = accent === 'emerald' ? 'text-emerald' : 'text-rose';
  const bgColorClass = accent === 'emerald' ? 'bg-emerald' : 'bg-rose';

  return (
    <div className="bg-white p-3 rounded-4 shadow-sm h-100 border border-white">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2 font-mono" style={{ fontSize: '0.55rem' }}>{label}</div>
      {isEdit ? (
        <div className="input-group input-group-sm border-bottom border-secondary-subtle">
          <input 
            type="number" 
            className="form-control border-0 bg-transparent text-navy p-0 fw-bold" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
          />
          {unit && <span className="input-group-text border-0 bg-transparent text-muted small">{unit}</span>}
        </div>
      ) : (
        <div className={`fw-extrabold fs-5 ${textColorClass}`}>{value || "0"}<span className="small opacity-50 fw-medium ms-1">{unit}</span></div>
      )}
    </div>
  );
}
