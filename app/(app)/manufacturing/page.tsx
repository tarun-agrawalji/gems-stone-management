"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Wrench, Loader2, X, AlertCircle,
  CheckCircle2, GitBranch, ShoppingBag,
} from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";

const WEIGHT_UNITS = ["G", "KG", "CT"];

/* ─── Types ─────────────────────────────────────────────────────── */
type Manufacturing = {
  id: string;
  lotId: string;
  lot: { lotNumber: string; product: { name: string }; status: string };
  date: string;
  issuedTo: string;
  weight: number;
  weightUnit: string;
  pieces: number;
  labourCost: number;
  otherCost: number;
  totalManufacturingCost: number;
  status: string;
};

type ChildSubLot = {
  id: string;
  subLotNo: string;
  createdAt: string;
  lot: { lotNumber: string };
  parentSubLot: { subLotNo: string } | null;
  weight: number;
  weightUnit: string;
  pieces?: number;
  shape?: string;
  size?: string;
  lines?: number;
  length?: number;
  status: string;
};

type SubLot = {
  id: string;
  subLotNo: string;
  lotId: string;
  lot: { lotNumber: string; itemName?: string };
  weight: number;
  weightUnit: string;
  pieces?: number;
  shape?: string;
  size?: string;
  lines?: number;
  length?: number;
  status: string;
};

type Purchase = {
  id: string;
  lotId: string;
  netWeight: number;
  weightUnit: string;
  pieces?: number;
  size?: string;
  shape?: string;
  lines?: number;
  lineLength?: number;
  selectionWeight?: number;
  selectionPieces?: number;
  selectionLines?: number;
  selectionLength?: number;
};

type Mismatch = { field: string; label: string; purchaseValue: string; issuedValue: string };

type SubLotCard = {
  reason: "PARTIAL_ISSUE" | "REJECTION";
  title: string;
  weight: number;
  weightUnit: string;
  pieces?: number;
  shape?: string;
  size?: string;
  lines?: number;
  length?: number;
  mismatches?: Mismatch[];
};

/* ─── Component ─────────────────────────────────────────────────── */
export default function ManufacturingPage() {
  const [records, setRecords] = useState<Manufacturing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ── Lot lookup ── */
  const [lotNo, setLotNo] = useState("");
  const [lotLookupLoading, setLotLookupLoading] = useState(false);
  const [lotError, setLotError] = useState("");
  const [autoSubLot, setAutoSubLot] = useState<SubLot | null>(null); // primary sub-lot auto-selected
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  /* ── Sub-lot preview cards ── */
  const [subLotCards, setSubLotCards] = useState<SubLotCard[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    issuedTo: "",
    weight: "", weightUnit: "G",
    pieces: "", shape: "", size: "", lines: "", length: "",
    selectionWeight: "", selectionPieces: "", selectionShape: "",
    selectionSize: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "",
    returnToManufacturer: false, returnDate: "",
    labourCost: "", otherCost: "",
    entryType: "ISSUED",
  });

  /* ── Fetch records ── */
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/manufacturing?search=${search}`);
      if (!r.ok) {
        console.error("Failed to fetch manufacturing records:", r.statusText);
      } else {
        const data = await r.json();
        if (Array.isArray(data)) {
          setRecords(data);
          setTotal(data.length);
        } else {
          setRecords(data.manufacturing || []);
          setTotal(data.total || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching manufacturing records:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  /* ── Debounced lot lookup ── */
  useEffect(() => {
    if (!lotNo.trim()) {
      setAutoSubLot(null); setPurchase(null); setLotError(""); setSubLotCards([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLotLookupLoading(true);
      setLotError("");
      try {
        const r = await fetch(
          `/api/sublots?search=${encodeURIComponent(lotNo.trim())}&includePurchase=true`
        );
        const data = await r.json();
        const subs: SubLot[] = data.subLots || [];
        const purchasesMap: Record<string, Purchase> = data.purchasesByLotId || {};

        const matched = subs.filter(
          (sl) => sl.lot.lotNumber.toLowerCase() === lotNo.trim().toLowerCase()
        );
        const inStock = matched.filter((sl) => sl.status === "IN_STOCK");

        if (inStock.length === 0) {
          setLotError(`No IN_STOCK sub-lots found for lot "${lotNo.trim()}".`);
          setAutoSubLot(null); setPurchase(null);
        } else {
          // Pick primary sub-lot (largest weight)
          const primary = inStock.sort((a, b) => b.weight - a.weight)[0];
          setAutoSubLot(primary);
          setPurchase(purchasesMap[primary.lotId] ?? null);
          setLotError("");
        }
      } catch {
        setLotError("Failed to look up lot.");
        setAutoSubLot(null); setPurchase(null);
      }
      setLotLookupLoading(false);
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotNo]);

  /* ── Build sub-lot preview cards in real-time ── */
  useEffect(() => {
    const cards: SubLotCard[] = [];

    // --- Card 1: Partial issue vs purchase selection ---
    if (autoSubLot && form.entryType === "ISSUED") {
      const issuedWeight  = parseFloat(form.weight  || "0");
      const issuedPieces  = parseInt(form.pieces  || "0");
      const issuedLines   = parseInt(form.lines   || "0");
      const issuedLength  = parseFloat(form.length  || "0");
      const issuedSize    = form.size.trim().toLowerCase();

      const refWeight  = purchase?.selectionWeight  ?? purchase?.netWeight   ?? autoSubLot.weight;
      const refPieces  = purchase?.selectionPieces  ?? purchase?.pieces      ?? autoSubLot.pieces;
      const refLines   = purchase?.selectionLines   ?? purchase?.lines       ?? autoSubLot.lines;
      const refLength  = purchase?.selectionLength  ?? purchase?.lineLength  ?? autoSubLot.length;
      const refSize    = (autoSubLot.size ?? "").toLowerCase();

      const mismatches: Mismatch[] = [];
      if (issuedWeight > 0 && refWeight > 0 && issuedWeight < refWeight)
        mismatches.push({ field: "weight",  label: "Weight",      purchaseValue: `${refWeight} ${autoSubLot.weightUnit}`,  issuedValue: `${issuedWeight} ${form.weightUnit}` });
      if (issuedPieces > 0 && refPieces && issuedPieces < refPieces)
        mismatches.push({ field: "pieces",  label: "Pieces",      purchaseValue: `${refPieces}`,                           issuedValue: `${issuedPieces}` });
      if (issuedLines  > 0 && refLines  && issuedLines  < refLines)
        mismatches.push({ field: "lines",   label: "Lines",       purchaseValue: `${refLines}`,                            issuedValue: `${issuedLines}` });
      if (issuedLength > 0 && refLength && issuedLength < refLength)
        mismatches.push({ field: "length",  label: "Line Length", purchaseValue: `${refLength}`,                           issuedValue: `${issuedLength}` });
      if (issuedSize && refSize && issuedSize !== refSize)
        mismatches.push({ field: "size",    label: "Size",        purchaseValue: autoSubLot.size ?? "",                    issuedValue: form.size });

      if (mismatches.length > 0 && issuedWeight > 0) {
        cards.push({
          reason: "PARTIAL_ISSUE",
          title: "Partial Issue Sub-Lot",
          weight:     issuedWeight,
          weightUnit: form.weightUnit,
          pieces:     issuedPieces > 0 ? issuedPieces : undefined,
          shape:      form.shape  || autoSubLot.shape,
          size:       form.size   || autoSubLot.size,
          lines:      issuedLines  > 0 ? issuedLines  : undefined,
          length:     issuedLength > 0 ? issuedLength : undefined,
          mismatches,
        });
      }
    }

    // --- Card 2: Rejection sub-lot (RECEIVED mode) ---
    if (form.entryType === "RECEIVED" && autoSubLot) {
      const rejW = parseFloat(form.rejectionWeight || "0");
      const rejP = parseInt(form.rejectionPieces   || "0");
      const rejL = parseInt(form.rejectionLines    || "0");
      const rejLen = parseFloat(form.rejectionLength || "0");
      if (rejW > 0) {
        cards.push({
          reason: "REJECTION",
          title: "Rejection Sub-Lot",
          weight:     rejW,
          weightUnit: form.weightUnit,
          pieces:     rejP > 0 ? rejP : undefined,
          lines:      rejL > 0 ? rejL : undefined,
          length:     rejLen > 0 ? rejLen : undefined,
        });
      }
    }

    setSubLotCards(cards);
  }, [
    form.weight, form.weightUnit, form.pieces, form.lines, form.length, form.size, form.shape,
    form.rejectionWeight, form.rejectionPieces, form.rejectionLines, form.rejectionLength,
    form.entryType, autoSubLot, purchase,
  ]);

  /* ── Helpers ── */
  const totalMfgCost = parseFloat(form.labourCost || "0") + parseFloat(form.otherCost || "0");

  function resetForm() {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      issuedTo: "", weight: "", weightUnit: "G",
      pieces: "", shape: "", size: "", lines: "", length: "",
      selectionWeight: "", selectionPieces: "", selectionShape: "",
      selectionSize: "", selectionLines: "", selectionLength: "",
      rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "",
      returnToManufacturer: false, returnDate: "",
      labourCost: "", otherCost: "", entryType: "ISSUED",
    });
    setLotNo(""); setAutoSubLot(null); setPurchase(null);
    setLotError(""); setSubLotCards([]); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!autoSubLot) { setError("Please enter a valid Lot No to continue."); return; }
    setError("");
    setSaving(true);
    const r = await fetch("/api/manufacturing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        lotId: autoSubLot.lotId || autoSubLot.id,
        weight:            parseFloat(form.weight),
        pieces:            form.pieces  ? parseInt(form.pieces)   : undefined,
        lines:             form.lines   ? parseInt(form.lines)    : undefined,
        length:            form.length  ? parseFloat(form.length) : undefined,
        labourCost:        parseFloat(form.labourCost  || "0"),
        otherCost:         parseFloat(form.otherCost   || "0"),
      }),
    });
    setSaving(false);
    if (r.ok) { setShowForm(false); resetForm(); fetchRecords(); }
    else { const d = await r.json(); setError(d.error || "Failed to save"); }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));
  const hasPartialCard = subLotCards.some(c => c.reason === "PARTIAL_ISSUE");

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="container-fluid p-0" suppressHydrationWarning>
      {/* Header */}
      <div className="row mb-2 mb-xl-3" suppressHydrationWarning>
        <div className="col-auto d-none d-sm-block" suppressHydrationWarning>
          <h1 className="h3 d-inline align-middle text-white">Manufacturing</h1>
          <p className="text-white text-opacity-75 text-sm mt-1">{total} total records</p>
        </div>
        <div className="col-auto ms-auto text-end mt-n1" suppressHydrationWarning>
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-sm">
            <Plus className="w-4 h-4 me-1 align-middle d-inline-block" /> New Entry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-3" suppressHydrationWarning>
        <div className="card-body p-3" suppressHydrationWarning>
          <div className="input-group" style={{ maxWidth: '300px' }} suppressHydrationWarning>
            <span className="input-group-text"><Search className="w-4 h-4" /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lot, sub-lot, issued to..." className="form-control" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card flex-fill w-100" suppressHydrationWarning>
        <div className="table-responsive" suppressHydrationWarning>
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Lot No</th><th>Sub Lot</th><th>Date</th><th>Issued To</th>
                <th>Weight</th><th>Pieces</th><th>Labour Cost</th><th>Other Cost</th>
                <th>Total Mfg Cost</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-5 text-muted">No manufacturing records yet.</td></tr>
              ) : records.map((m) => (
                <tr key={m.id}>
                  <td><span className="font-monospace text-primary fw-medium">{m.lot?.lotNumber || "N/A"}</span></td>
                  <td><span className="font-monospace small">{m.lot?.product?.name || "—"}</span></td>
                  <td>{formatDate(m.date)}</td>
                  <td>{m.issuedTo || "—"}</td>
                  <td>{m.weight} {m.weightUnit}</td>
                  <td>{m.pieces || "—"}</td>
                  <td>{formatINR(m.labourCost)}</td>
                  <td>{formatINR(m.otherCost)}</td>
                  <td className="fw-semibold text-warning">{formatINR(m.totalManufacturingCost)}</td>
                  <td><span className={`badge border ${getStatusColor(m.lot?.status || "PENDING")}`}>{getStatusLabel(m.lot?.status || "PENDING")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ─────────────────────────────────────────────── */}
      {showForm && (
        <ModalPortal>
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '40px', width: '92%', maxWidth: '750px' }}>
            <div className="modal-content border-0 shadow text-sm">
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1.1rem' }}>New Manufacturing Entry</h5>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.75rem', opacity: 0.6 }} onClick={() => { setShowForm(false); resetForm(); }} aria-label="Close"></button>
              </div>

              <div className="modal-body pb-4">
                <form id="manufacturingForm" onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="alert alert-danger p-2 text-sm d-flex align-items-center mb-3">
                      <AlertCircle className="w-4 h-4 me-2 shrink-0" /> {error}
                    </div>
                  )}

                  {/* Toggle */}
                  <div className="d-flex gap-2 mb-4">
                    {["ISSUED", "RECEIVED"].map((type) => (
                      <button key={type} type="button" onClick={() => setForm(p => ({ ...p, entryType: type }))}
                        className={`flex-fill btn ${form.entryType === type ? "btn-primary" : "btn-outline-secondary"}`}>
                        {type === "ISSUED" ? "Issue to Manufacturer" : "Receive from Manufacturer"}
                      </button>
                    ))}
                  </div>

                  <div className="row g-3">

                {/* ══════════════════════════════════════════════
                    Lot No input — auto-detects sub-lot
                ══════════════════════════════════════════════ */}
                <div className="col-md-12">
                  <label className="form-label mb-1">Lot No *</label>
                  <div className="position-relative">
                    <input
                      value={lotNo}
                      onChange={(e) => setLotNo(e.target.value)}
                      placeholder="Enter Lot No (e.g. L001) — sub-lot assigned automatically"
                      className={`form-control pe-5 ${lotError ? "is-invalid" : autoSubLot ? "border-success" : ""}`}
                    />
                    {lotLookupLoading && <Loader2 className="w-4 h-4 animate-spin position-absolute end-0 top-50 translate-middle text-muted" />}
                    {!lotLookupLoading && autoSubLot && <CheckCircle2 className="w-4 h-4 position-absolute end-0 top-50 translate-middle text-success me-2" />}
                  </div>
                  {lotError && <div className="invalid-feedback d-block"><AlertCircle className="w-3 h-3 me-1 d-inline-block" />{lotError}</div>}
                </div>

                {/* ══════════════════════════════════════════════
                    SUB LOT NO SECTION (Minimal)
                ══════════════════════════════════════════════ */}
                <div className="col-md-12">
                  <label className="form-label mb-1">Sub Lot No *</label>
                  {!autoSubLot ? (
                    <div className="form-control bg-light text-muted opacity-75 d-flex align-items-center" style={{ cursor: "not-allowed" }}>
                      <span className="small">Auto-assigned when Lot No is entered</span>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {/* Active Sub Lot */}
                      <div className="form-control bg-light d-flex align-items-center justify-content-between" style={{ cursor: "not-allowed" }}>
                        <span className="font-monospace small fw-bold text-primary">{autoSubLot.subLotNo}</span>
                        <span className="badge bg-secondary text-uppercase fw-bold" style={{ fontSize: "10px" }}>Active</span>
                      </div>

                      {/* Auto-Generated (if any) */}
                      {subLotCards.map((card, idx) => (
                        <div key={card.reason} className="form-control border-warning bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning bg-opacity-25 text-warning fw-bold py-1 px-2" style={{ fontSize: "10px" }}>#{idx + 1}</span>
                            <span className="font-monospace small fw-bold tracking-wide d-flex align-items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              Auto-Generated on Save
                            </span>
                          </div>
                          <span className="badge border border-warning text-warning rounded-pill px-2 py-1" style={{ fontSize: "10px" }}>
                            {card.reason === "REJECTION" ? "Rejection" : "Partial Issue"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All-match confirmation */}
                {autoSubLot && purchase && form.weight && !hasPartialCard && form.entryType === "ISSUED" && (
                  <div className="col-md-12">
                    <div className="alert alert-success py-2 px-3 m-0 d-flex align-items-center" style={{ fontSize: '12px' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 me-2 flex-shrink-0" />
                      Issued quantities match purchase selection — no new sub-lot will be created.
                    </div>
                  </div>
                )}

                {/* Date & Issued To */}
                <div className="col-md-6">
                  <label className="form-label mb-1">Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1">
                    {form.entryType === "ISSUED" ? "Issued To" : "Received From"}
                  </label>
                  <input value={form.issuedTo} onChange={(e) => f("issuedTo", e.target.value)} placeholder="Manufacturer name" className="form-control" />
                </div>

                {/* ── Issued / Received Details ── */}
                <div className="col-md-12 border-bottom pb-4 mb-2 mt-4 pt-3 border-top">
                  <p className="small fw-bold text-muted text-uppercase mb-3">
                    {form.entryType === "ISSUED" ? "Issued" : "Received"} Details
                  </p>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label mb-1">Weight Unit</label>
                      <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="form-select">
                        {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-1">Weight *</label>
                      <input required type="number" step="0.001" value={form.weight} onChange={(e) => f("weight", e.target.value)} placeholder="0.000" className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-1">Pieces</label>
                      <input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label mb-1">Shape</label>
                      <input value={form.shape} onChange={(e) => f("shape", e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label mb-1">Size</label>
                      <input value={form.size} onChange={(e) => f("size", e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label mb-1">Lines</label>
                      <input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label mb-1">Length</label>
                      <input type="number" step="0.01" value={form.length} onChange={(e) => f("length", e.target.value)} className="form-control" />
                    </div>
                  </div>
                </div>

                {/* RECEIVED-only */}
                {form.entryType === "RECEIVED" && (
                  <div className="row mt-4">
                    <div className="col-md-6 border-top pt-3">
                      <p className="small fw-bold text-success text-uppercase mb-3">Selection</p>
                      <div className="row g-3">
                        <div className="col-12"><label className="form-label mb-1">Weight</label><input type="number" step="0.001" value={form.selectionWeight} onChange={(e) => f("selectionWeight", e.target.value)} placeholder="0.000" className="form-control" /></div>
                        <div className="col-12"><label className="form-label mb-1">Pieces</label><input type="number" value={form.selectionPieces} onChange={(e) => f("selectionPieces", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">Shape</label><input value={form.selectionShape} onChange={(e) => f("selectionShape", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">Size</label><input value={form.selectionSize} onChange={(e) => f("selectionSize", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">No. Lines</label><input type="number" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">Length</label><input type="number" step="0.01" value={form.selectionLength} onChange={(e) => f("selectionLength", e.target.value)} className="form-control" /></div>
                      </div>
                    </div>

                    <div className="col-md-6 border-top pt-3">
                      <p className="small fw-bold text-danger text-uppercase mb-3">
                        Rejection
                        {subLotCards.some(c => c.reason === "REJECTION") && (
                          <span className="ms-2 text-warning text-lowercase fw-normal" style={{ fontSize: '10px' }}>↳ rejection sub-lot auto-created</span>
                        )}
                      </p>
                      <div className="row g-3">
                        <div className="col-12"><label className="form-label mb-1">Weight</label><input type="number" step="0.001" value={form.rejectionWeight} onChange={(e) => f("rejectionWeight", e.target.value)} placeholder="0.000" className="form-control" /></div>
                        <div className="col-12"><label className="form-label mb-1">Pieces</label><input type="number" value={form.rejectionPieces} onChange={(e) => f("rejectionPieces", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">No. Lines</label><input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} className="form-control" /></div>
                        <div className="col-6"><label className="form-label mb-1">Length</label><input type="number" step="0.01" value={form.rejectionLength} onChange={(e) => f("rejectionLength", e.target.value)} className="form-control" /></div>
                      </div>
                    </div>

                    <div className="col-md-12 border-top pt-3 mt-4">
                      <p className="small fw-bold text-muted text-uppercase mb-3">Rejection Return</p>
                      <div className="row g-3">
                        <div className="col-md-6 d-flex align-items-center mt-4 pt-2">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="returnManufacturers" checked={form.returnToManufacturer}
                              onChange={(e) => setForm(p => ({ ...p, returnToManufacturer: e.target.checked }))} />
                            <label className="form-check-label" htmlFor="returnManufacturers">
                              Return to Manufacturer?
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label mb-1">Return Date</label>
                          <input type="date" value={form.returnDate} onChange={(e) => f("returnDate", e.target.value)} className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  </div> {/* end row */}

              {/* Costing */}
              <div className="mt-4 pt-3 border-top">
                <p className="small fw-bold text-muted text-uppercase mb-3">Costing</p>
                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label mb-1">Labour Cost (₹)</label><input type="number" step="0.01" value={form.labourCost} onChange={(e) => f("labourCost", e.target.value)} placeholder="0.00" className="form-control" /></div>
                  <div className="col-md-6"><label className="form-label mb-1">Other Cost (₹)</label><input type="number" step="0.01" value={form.otherCost} onChange={(e) => f("otherCost", e.target.value)} placeholder="0.00" className="form-control" /></div>
                </div>
                <div className="mt-3 p-3 bg-light rounded d-flex align-items-center gap-2">
                  <span className="small text-muted">Total Manufacturing Cost (Auto):</span>
                  <span className="fw-bold text-warning">{formatINR(totalMfgCost)}</span>
                </div>
              </div>

                  <div className="d-flex justify-content-end pt-3 border-top mt-4">
                    <button type="submit" form="manufacturingForm" disabled={saving || !autoSubLot}
                      className="btn btn-primary d-flex align-items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? "Saving..." : subLotCards.length > 0
                        ? `Save & Create ${subLotCards.length} Sub-Lot${subLotCards.length > 1 ? "s" : ""}`
                        : "Save Entry"}
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
