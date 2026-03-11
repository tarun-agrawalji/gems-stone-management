"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ShoppingCart, Loader2, X, ChevronDown, AlertCircle, ExternalLink } from "lucide-react";
import { formatINR, formatDate, getCategoryLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";
import Link from "next/link";

const WEIGHT_UNITS = ["G", "KG", "CT"];
const CATEGORIES = ["ROUGH", "READY_GOODS", "BY_ORDER"];

type Purchase = {
  id: string;
  lotId: string;
  lot: { 
    lotNumber: string; 
    category: string;
    itemName: string;
  };
  date: string;
  itemName: string;
  supplier: string;
  grossWeight: number;
  netWeight: number;
  weightUnit: string;
  purchasePrice: number;
  totalCost: number;
  costPerGram: number;
  rejectionDate: string | null;
  rejectionStatus: string | null;
};

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const INITIAL_FORM_STATE = {
    lotNo: "", date: new Date().toISOString().slice(0, 10), itemName: "", category: "ROUGH",
    supplierName: "", descriptionRef: "", 
    grossWeight: "", lessWeight: "0", weightUnit: "G", size: "", shape: "", lines: "", lineLength: "", pieces: "",
    selectionWeight: "", selectionPieces: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "", rejectionDate: "", rejectionStatus: "PENDING",
    purchasePrice: "",
  };

  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/purchase?search=${search}`, { 
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (!r.ok) {
        console.error("Failed to fetch purchases:", r.statusText);
      } else {
        const data = await r.json();
        // Since the API now returns an array directly:
        if (Array.isArray(data)) {
          setPurchases(data);
          setTotal(data.length);
        } else {
          setPurchases(data.purchases || []);
          setTotal(data.total || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const num = (v: string) => parseFloat(v || "0");
  const netWeight = num(form.grossWeight) - num(form.lessWeight);
  const netPieces = parseInt(form.pieces || "0");
  const netLines = parseInt(form.lines || "0");
  const totalCostCalc = num(form.purchasePrice);
  const netWeightG = form.weightUnit === "KG" ? netWeight * 1000 : form.weightUnit === "CT" ? netWeight * 0.2 : netWeight;
  const costPerGram = netWeightG > 0 ? totalCostCalc / netWeightG : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Double check validation before submit
    const sw = num(form.selectionWeight);
    const sp = parseInt(form.selectionPieces || "0");
    const sl = parseInt(form.selectionLines || "0");

    if (sw > netWeight) { setError(`Selection weight (${sw}) cannot exceed net weight (${netWeight.toFixed(3)})`); return; }
    if (sp > netPieces) { setError(`Selection pieces (${sp}) cannot exceed total pieces (${netPieces})`); return; }
    if (sl > netLines) { setError(`Selection lines (${sl}) cannot exceed total lines (${netLines})`); return; }

    setSaving(true);
    const r = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        grossWeight: parseFloat(form.grossWeight),
        lessWeight: parseFloat(form.lessWeight || "0"),
        lines: form.lines ? parseInt(form.lines) : undefined,
        lineLength: form.lineLength ? parseFloat(form.lineLength) : undefined,
        pieces: form.pieces ? parseInt(form.pieces) : undefined,
        
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
        
        purchasePrice: parseFloat(form.purchasePrice),
        // Add supplier mapping for backward compatibility in backend if needed
        supplierName: form.supplierName,
      }),
    });
    // setSaving(false) is called at the end of the function
    if (r.ok) {
      handleCloseModal();
    } else {
      const d = await r.json();
      setError(d.details ? `${d.error}: ${d.details}` : d.error || "Failed to save purchase");
    }
    setSaving(false);
  }

  const handleCloseModal = () => {
    setShowForm(false);
    setForm(INITIAL_FORM_STATE);
    setError("");
  };

  const f = (k: string, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      
      // Auto-fill rejection based on selection
      if (k === "selectionWeight" || k === "grossWeight" || k === "lessWeight") {
        const nw = parseFloat(next.grossWeight || "0") - parseFloat(next.lessWeight || "0");
        const sw = parseFloat(next.selectionWeight || "0");
        if (sw <= nw) {
          next.rejectionWeight = (nw - sw).toFixed(3);
          setError("");
        } else {
          setError(`Selection weight (${sw}) exceeds net weight (${nw.toFixed(3)})`);
        }
      }
      
      if (k === "selectionPieces" || k === "pieces") {
        const np = parseInt(next.pieces || "0");
        const sp = parseInt(next.selectionPieces || "0");
        if (sp <= np) {
          next.rejectionPieces = (np - sp).toString();
          setError("");
        } else {
          setError(`Selection pieces (${sp}) exceeds total pieces (${np})`);
        }
      }

      if (k === "selectionLines" || k === "lines") {
        const nl = parseInt(next.lines || "0");
        const sl = parseInt(next.selectionLines || "0");
        if (sl <= nl) {
          next.rejectionLines = (nl - sl).toString();
          setError("");
        } else {
          setError(`Selection lines (${sl}) exceeds total lines (${nl})`);
        }
      }

      return next;
    });
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white">Purchase</h1>
          <p className="text-white text-opacity-75 text-sm mt-1">{total} total records</p>
        </div>
        <div className="col-auto ms-auto text-end mt-n1">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary shadow-sm"
          >
            <Plus className="w-4 h-4 me-1 align-middle d-inline-block" /> New Purchase
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text"><Search className="w-4 h-4" /></span>
            <input
              type="text"
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
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Lot No</th>
                <th>Date</th>
                <th>Item Name</th>
                <th>Supplier</th>
                <th className="text-end">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">
                  No purchases yet. Click "New Purchase" to add one.
                </td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/purchase/${p.id}`} className="text-decoration-none font-mono fw-bold text-primary border-bottom border-primary border-opacity-25 pb-1 d-inline-flex align-items-center gap-1 hover-link">
                      {p.lot?.lotNumber || "N/A"}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </Link>
                  </td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.itemName || "—"}</td>
                  <td>{p.supplier || "—"}</td>
                  <td className="text-end font-semibold text-amber-400">
                    {formatINR(p.totalCost || p.purchasePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showForm && (
        <ModalPortal>
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '40px', width: '92%', maxWidth: '750px' }}>
            <div className="modal-content border-0 shadow text-sm">
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1.1rem' }}>New Purchase Entry</h5>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.75rem', opacity: 0.6 }} onClick={handleCloseModal} aria-label="Close"></button>
              </div>
              <div className="modal-body pb-4">
                <form id="purchaseForm" onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="alert alert-danger p-2 text-sm d-flex align-items-center mb-3">
                      <AlertCircle className="w-4 h-4 me-2" /> {error}
                    </div>
                  )}
                  <div className="row g-3">
                    <Field label="Lot No *" className="col-md-6" required><input required value={form.lotNo} onChange={(e) => f("lotNo", e.target.value)} placeholder="e.g. LOT-101" className="form-control" /></Field>
                    <Field label="Date *" className="col-md-6" required><input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" /></Field>
                    <Field label="Item Name" className="col-md-6"><input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} placeholder="e.g. Amethyst" className="form-control" /></Field>
                    <Field label="Category" className="col-md-6">
                      <select value={form.category} onChange={(e) => f("category", e.target.value)} className="form-select">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                      </select>
                    </Field>
                    <Field label="Supplier Name" className="col-md-12"><input value={form.supplierName} onChange={(e) => f("supplierName", e.target.value)} placeholder="Supplier name" className="form-control" /></Field>
                    <Field label="Description / Reference" className="col-md-12"><input value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} placeholder="Reference notes" className="form-control" /></Field>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <p className="small fw-bold text-muted text-uppercase mb-3">Received</p>
                    <div className="row g-3 mb-3">
                      <Field label="Weight Unit" className="col-md-4">
                        <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="form-select">
                          {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </Field>
                      <Field label="Gross Weight *" className="col-md-4" required><input required type="number" step="0.001" value={form.grossWeight} onChange={(e) => f("grossWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                      <Field label="Less Weight" className="col-md-4"><input type="number" step="0.001" value={form.lessWeight} onChange={(e) => f("lessWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                    </div>
                    <div className="row g-3 mb-3">
                      <Field label="Size" className="col-md-4"><input value={form.size} onChange={(e) => f("size", e.target.value)} placeholder="10mm" className="form-control" /></Field>
                      <Field label="Shape" className="col-md-4"><input value={form.shape} onChange={(e) => f("shape", e.target.value)} placeholder="Round" className="form-control" /></Field>
                      <Field label="Total Pieces" className="col-md-4"><input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} placeholder="0" className="form-control" /></Field>
                    </div>
                    <div className="row g-3 mb-3">
                      <Field label="No. of Lines" className="col-md-6"><input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} placeholder="0" className="form-control" /></Field>
                      <Field label="Line Length" className="col-md-6"><input type="number" step="0.01" value={form.lineLength} onChange={(e) => f("lineLength", e.target.value)} placeholder="0.00" className="form-control" /></Field>
                    </div>
                    <div className="p-3 bg-light rounded mt-2">
                      <span className="small text-muted">Net Weight (Auto): </span>
                      <strong className="text-primary">{netWeight.toFixed(3)} {form.weightUnit}</strong>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-md-6 border-top pt-3">
                      <p className="small fw-bold text-success text-uppercase mb-3">Selection</p>
                      <div className="row g-3">
                        <Field 
                          label="Weight" 
                          className="col-12" 
                          error={num(form.selectionWeight) > netWeight ? "Exceeds net weight" : ""}
                        >
                          <input type="number" step="0.001" value={form.selectionWeight} onChange={(e) => f("selectionWeight", e.target.value)} placeholder="0.000" className={`form-control ${num(form.selectionWeight) > netWeight ? 'is-invalid' : ''}`} />
                        </Field>
                        <Field 
                          label="Pieces" 
                          className="col-12"
                          error={parseInt(form.selectionPieces || "0") > netPieces ? "Exceeds total pieces" : ""}
                        >
                          <input type="number" value={form.selectionPieces} onChange={(e) => f("selectionPieces", e.target.value)} placeholder="0" className={`form-control ${parseInt(form.selectionPieces || "0") > netPieces ? 'is-invalid' : ''}`} />
                        </Field>
                        <Field 
                          label="No. of Lines" 
                          className="col-12"
                          error={parseInt(form.selectionLines || "0") > netLines ? "Exceeds total lines" : ""}
                        >
                          <input type="number" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)} placeholder="0" className={`form-control ${parseInt(form.selectionLines || "0") > netLines ? 'is-invalid' : ''}`} />
                        </Field>
                        <Field label="Line Length" className="col-12"><input type="number" step="0.01" value={form.selectionLength} onChange={(e) => f("selectionLength", e.target.value)} placeholder="0.00" className="form-control" /></Field>
                      </div>
                    </div>

                    <div className="col-md-6 border-top pt-3">
                      <p className="small fw-bold text-danger text-uppercase mb-3">Rejection</p>
                      <div className="row g-3">
                        <Field label="Weight" className="col-12"><input type="number" step="0.001" value={form.rejectionWeight} onChange={(e) => f("rejectionWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                        <Field label="Pieces" className="col-12"><input type="number" value={form.rejectionPieces} onChange={(e) => f("rejectionPieces", e.target.value)} placeholder="0" className="form-control" /></Field>
                        <Field label="No. Lines" className="col-6"><input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} placeholder="0" className="form-control" /></Field>
                        <Field label="Line Length" className="col-6"><input type="number" step="0.01" value={form.rejectionLength} onChange={(e) => f("rejectionLength", e.target.value)} placeholder="0.00" className="form-control" /></Field>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <p className="small fw-bold text-muted text-uppercase mb-3">Rejection Return Details</p>
                    <div className="row g-3 mb-3">
                      <Field label="Date of Return" className="col-md-6">
                        <input type="date" value={form.rejectionDate} onChange={(e) => f("rejectionDate", e.target.value)} className="form-control" />
                      </Field>
                      <Field label="Rejection Status" className="col-md-6">
                        <select value={form.rejectionStatus} onChange={(e) => f("rejectionStatus", e.target.value)} className="form-select">
                          <option value="PENDING">PENDING</option>
                          <option value="RETURNED">RETURNED</option>
                          <option value="RESELLABLE">RESELLABLE</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-top pb-3">
                    <p className="small fw-bold text-muted text-uppercase mb-3">Pricing</p>
                    <div className="row g-3">
                      <Field label="Purchase Price (₹) *" className="col-md-6" required><input required type="number" step="0.01" value={form.purchasePrice} onChange={(e) => f("purchasePrice", e.target.value)} placeholder="0.00" className="form-control" /></Field>
                      <div className="col-md-6 d-flex flex-column justify-content-end">
                        <div className="p-3 bg-light rounded content-box">
                          <p className="small text-muted mb-1">Cost per gram: <strong className="text-primary">{formatINR(costPerGram)}</strong></p>
                          <p className="small text-muted mb-0">Total cost: <strong className="text-warning">{formatINR(totalCostCalc)}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end pt-3 border-top">
                    <button type="submit" form="purchaseForm" disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? "Saving..." : "Save Purchase"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}

function Field({ label, children, className = "", required, error }: { label: string; children: React.ReactNode; className?: string; required?: boolean; error?: string }) {
  return (
    <div className={className}>
      <label className="form-label mb-1">{label}</label>
      {children}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
