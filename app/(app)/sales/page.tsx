"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Plus, Search, TrendingUp, Loader2, X, AlertCircle, CheckCircle2, GitBranch } from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";

type Sale = {
  id: string;
  lotId: string;
  lot: { lotNumber: string; product: { name: string }; status: string };
  date: string;
  customer: string;
  salePrice: number;
  discount: number;
  netSale: number;
  tax: number;
  finalBillAmount: number;
  billNo: string;
  status: string;
};

type SubLotCard = {
  reason: "PARTIAL_SALE";
  title: string;
  weight: number;
  weightUnit: string;
  pieces?: number;
  shape?: string;
  size?: string;
  lines?: number;
  length?: number;
};

type SubLot = { id: string; subLotNo: string; lotId: string; lot: { lotNumber: string }; weight: number; weightUnit: string; pieces?: number; shape?: string; size?: string; lines?: number; length?: number; status: string };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* -- Lot lookup -- */
  const [lotNo, setLotNo] = useState("");
  const [lotLookupLoading, setLotLookupLoading] = useState(false);
  const [lotError, setLotError] = useState("");
  const [autoSubLot, setAutoSubLot] = useState<SubLot | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    subLotId: "", date: new Date().toISOString().slice(0, 10), soldTo: "",
    salePrice: "", discount: "0", tax: "0", billNo: "",
    itemName: "", descriptionRef: "",
    weight: "", weightUnit: "G", size: "", shape: "", pieces: "", lines: "", length: "",
    returnedWeight: "", returnedPieces: "", returnedLines: "", returnedLength: "", returnDate: "",
    isReturn: false, manualSubLotNo: "",
  });

  /* -- Sub-lot preview cards -- */
  const subLotCards = useMemo(() => {
    if (!autoSubLot) return [];
    const cards: SubLotCard[] = [];
    
    // Parse issued values
    const iw = parseFloat(form.weight) || 0;
    const ip = parseInt(form.pieces) || 0;
    
    // Original available
    const ow = autoSubLot.weight;
    const op = autoSubLot.pieces || 0;
    
    // Is it a partial sale?
    const partialWeight = iw > 0 && iw < ow;
    const partialPieces = ip > 0 && op > 0 && ip < op;
    
    if (partialWeight || partialPieces) {
      const remW = Math.max(0, ow - iw);
      const remP = Math.max(0, op - ip);
      cards.push({
        reason: "PARTIAL_SALE",
        title: "Partial Sale (Remaining)",
        weight: Number(remW.toFixed(3)),
        weightUnit: autoSubLot.weightUnit,
        pieces: remP > 0 ? remP : undefined,
        shape: autoSubLot.shape,
        size: autoSubLot.size,
        lines: autoSubLot.lines,
        length: autoSubLot.length,
      });
    }
    return cards;
  }, [autoSubLot, form.weight, form.pieces]);
  
  const hasPartialCard = subLotCards.some(c => c.reason === "PARTIAL_SALE");

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/sales?search=${search}`);
      if (!r.ok) {
        console.error("Failed to fetch sales:", r.statusText);
      } else {
        const data = await r.json();
        if (Array.isArray(data)) {
          setSales(data);
          setTotal(data.length);
        } else {
          setSales(data.sales || []);
          setTotal(data.total || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  /* ── Debounced lot lookup ── */
  useEffect(() => {
    if (!lotNo.trim() || !showForm) {
      setAutoSubLot(null); setLotError("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLotLookupLoading(true);
      setLotError("");
      try {
        const r = await fetch(
          `/api/sublots?search=${encodeURIComponent(lotNo.trim())}`
        );
        const data = await r.json();
        const subs: SubLot[] = data.subLots || [];

        const matched = subs.filter(
          (sl) => sl.lot.lotNumber.toLowerCase() === lotNo.trim().toLowerCase()
        );
        const ready = matched.filter((sl) => sl.status === "READY");

        if (ready.length === 0) {
          setLotError(`No READY sub-lots found for lot "${lotNo.trim()}".`);
          setAutoSubLot(null);
        } else {
          setAutoSubLot(ready[0]);
          setForm((prev) => ({
            ...prev,
            weight: ready[0].weight.toString(),
            weightUnit: ready[0].weightUnit || prev.weightUnit,
            pieces: ready[0].pieces?.toString() || "",
            shape: ready[0].shape || "",
            size: ready[0].size || "",
            lines: ready[0].lines?.toString() || "",
            length: ready[0].length?.toString() || "",
          }));
        }
      } catch (err) {
        setLotError("Failed to lookup lot.");
        setAutoSubLot(null);
      } finally {
        setLotLookupLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current!);
  }, [lotNo, showForm]);

  const netSale = parseFloat(form.salePrice || "0") - parseFloat(form.discount || "0");
  const finalBill = netSale + parseFloat(form.tax || "0");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!autoSubLot) {
      setError("Please select a valid Lot No.");
      return;
    }
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      lotId: autoSubLot.lotId || autoSubLot.id,
      customerName: form.soldTo,
      salePrice: parseFloat(form.salePrice),
      discount: parseFloat(form.discount || "0"),
      tax: parseFloat(form.tax || "0"),
      weight: form.weight ? parseFloat(form.weight) : undefined,
      pieces: form.pieces ? parseInt(form.pieces) : undefined,
      lines: form.lines ? parseInt(form.lines) : undefined,
      length: form.length ? parseFloat(form.length) : undefined,
      netSale: netSale,
      finalBillAmount: finalBill,
    };

    const r = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      fetchSales();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to save");
    }
  }

  const f = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-white mb-1" /> Sales
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">{total} total records</p>
        </div>
        <div className="col-auto ms-auto text-end mt-n1">
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-sm">
            <Plus className="w-4 h-4 me-1 align-middle d-inline-block" /> New Sale
          </button>
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
              placeholder="Search lot, customer, bill no..." 
              className="form-control" 
            />
          </div>
        </div>
      </div>

      <div className="card flex-fill w-100">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Lot No</th><th>Sub Lot</th><th>Date</th><th>Sold To</th>
                <th>Sale Price</th><th>Discount</th><th>Net Sale</th>
                <th>Tax</th><th>Final Bill</th><th>Bill No</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-5 text-muted">No sales yet.</td></tr>
              ) : sales.map((s) => (
                <tr key={s.id}>
                  <td><span className="font-monospace text-primary fw-medium">{s.lot?.lotNumber || "N/A"}</span></td>
                  <td><span className="font-monospace small">{s.lot?.product?.name || "—"}</span></td>
                  <td>{formatDate(s.date)}</td>
                  <td>{s.customer || "—"}</td>
                  <td>{formatINR(s.salePrice)}</td>
                  <td className="text-danger">{s.discount > 0 ? `-${formatINR(s.discount)}` : "—"}</td>
                  <td>{formatINR(s.netSale)}</td>
                  <td>{s.tax > 0 ? formatINR(s.tax) : "—"}</td>
                  <td className="fw-bold text-success">{formatINR(s.finalBillAmount)}</td>
                  <td>{s.billNo || "—"}</td>
                  <td><span className="badge" style={{ backgroundColor: getStatusColor(s.lot?.status || "SOLD") }}>{getStatusLabel(s.lot?.status || "SOLD")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ModalPortal>
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '40px', width: '92%', maxWidth: '750px' }}>
            <div className="modal-content border-0 shadow text-sm">
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1.1rem' }}>New Sale Entry</h5>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.75rem', opacity: 0.6 }} onClick={() => setShowForm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body pb-4">
                <form onSubmit={handleSubmit} id="salesForm" className="space-y-4">
                {error && <div className="alert alert-danger d-flex align-items-center p-2 mb-3"><AlertCircle className="w-4 h-4 me-2" />{error}</div>}

                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label mb-1">Lot No *</label>
                    <div className="input-group">
                      <input
                        value={lotNo}
                        onChange={(e) => setLotNo(e.target.value)}
                        placeholder="Enter Lot No (e.g. L001) — sub-lot assigned automatically"
                        className={`form-control ${lotError ? "is-invalid" : autoSubLot ? "is-valid" : ""}`}
                      />
                      <span className="input-group-text bg-white">
                        {lotLookupLoading && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
                        {!lotLookupLoading && autoSubLot && <CheckCircle2 className="w-4 h-4 text-success" />}
                      </span>
                    </div>
                    {lotError && <div className="invalid-feedback d-block"><AlertCircle className="w-3 h-3 me-1 d-inline" />{lotError}</div>}
                  </div>

              {/* ══════════════════════════════════════════════
                  SUB LOT NO SECTION (Minimal)
              ══════════════════════════════════════════════ */}
              <div className="col-12 mt-3">
                <label className="form-label mb-1">Sub Lot No *</label>
                {!autoSubLot ? (
                  <div className="form-control bg-light text-muted opacity-50">
                    <span className="small">Auto-assigned when Lot No is entered</span>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {/* Active Sub Lot */}
                    <div className="form-control bg-light d-flex justify-content-between align-items-center">
                      <span className="font-monospace small fw-bold text-primary">{autoSubLot.subLotNo}</span>
                      <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>Active</span>
                    </div>

                    {/* Auto-Generated (if any) */}
                    {subLotCards.map((card, idx) => (
                      <div key={card.reason} className="form-control bg-warning bg-opacity-10 border-warning border-opacity-25 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-warning text-dark px-1.5">#{idx + 1}</span>
                          <span className="font-monospace small fw-bold text-warning d-flex align-items-center gap-1">
                            <GitBranch className="w-3 h-3" /> Auto-Generated on Save
                          </span>
                        </div>
                        <span className="badge bg-warning text-dark border border-warning" style={{ fontSize: '10px' }}>Partial Sale</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {autoSubLot && form.weight && !hasPartialCard && (
                <div className="col-12 mt-2">
                  <div className="alert alert-success d-flex align-items-center p-2 small mb-0">
                    <CheckCircle2 className="w-4 h-4 me-2 flex-shrink-0" />
                    Selling entire available stock — no new sub-lot will be created.
                  </div>
                </div>
              )}
              <div className="col-md-6 mt-3">
                <label className="form-label mb-1">Date *</label>
                <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" />
              </div>
              <div className="col-md-6 mt-3">
                <label className="form-label mb-1">Sold To</label>
                <input value={form.soldTo} onChange={(e) => f("soldTo", e.target.value)} placeholder="Customer name" className="form-control" />
              </div>
            </div>

            <div className="border-top border-bottom py-3 mb-3">
              <p className="small text-uppercase fw-bold text-muted mb-3">Item Details</p>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label mb-1">Item Name</label>
                  <input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} className="form-control" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label mb-1">Description Reference</label>
                  <input value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} className="form-control" />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label mb-1">Weight</label>
                  <input type="number" step="0.001" value={form.weight} onChange={(e) => f("weight", e.target.value)} placeholder="Auto from Sublot" className="form-control" />
                </div>
                <div className="col-sm-4">
                  <label className="form-label mb-1">Unit</label>
                  <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="form-select">
                    <option>G</option><option>KG</option><option>CT</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label mb-1">Pieces</label>
                  <input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} className="form-control" />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-sm-3">
                  <label className="form-label mb-1">Shape</label>
                  <input value={form.shape} onChange={(e) => f("shape", e.target.value)} className="form-control" />
                </div>
                <div className="col-sm-3">
                  <label className="form-label mb-1">Size</label>
                  <input value={form.size} onChange={(e) => f("size", e.target.value)} className="form-control" />
                </div>
                <div className="col-sm-3">
                  <label className="form-label mb-1">Lines</label>
                  <input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} className="form-control" />
                </div>
                <div className="col-sm-3">
                  <label className="form-label mb-1">Length</label>
                  <input type="number" step="0.01" value={form.length} onChange={(e) => f("length", e.target.value)} className="form-control" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="isReturnCheckbox" checked={form.isReturn} onChange={(e) => f("isReturn", e.target.checked)} />
                <label className="form-check-label" htmlFor="isReturnCheckbox">
                  Customer Return / Rejection
                </label>
              </div>

              {form.isReturn && (
                <div className="card bg-danger bg-opacity-10 border border-danger border-opacity-25 shadow-none mb-3">
                  <div className="card-body p-3">
                    <p className="small text-danger text-uppercase fw-bold mb-3">Return Details</p>
                    <div className="row g-3 mb-2">
                      <div className="col-sm-6">
                        <label className="form-label mb-1">Returned Weight</label>
                        <input type="number" step="0.001" value={form.returnedWeight} onChange={(e) => f("returnedWeight", e.target.value)} placeholder="0.000" className="form-control" />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label mb-1">Returned Pieces</label>
                        <input type="number" value={form.returnedPieces} onChange={(e) => f("returnedPieces", e.target.value)} className="form-control" />
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-sm-4">
                        <label className="form-label mb-1">Returned Lines</label>
                        <input type="number" value={form.returnedLines} onChange={(e) => f("returnedLines", e.target.value)} className="form-control" />
                      </div>
                      <div className="col-sm-4">
                        <label className="form-label mb-1">Return Length</label>
                        <input type="number" step="0.01" value={form.returnedLength} onChange={(e) => f("returnedLength", e.target.value)} className="form-control" />
                      </div>
                      <div className="col-sm-4">
                        <label className="form-label mb-1">Return Date</label>
                        <input type="date" value={form.returnDate} onChange={(e) => f("returnDate", e.target.value)} className="form-control" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6 col-md-3">
                <label className="form-label mb-1">Sale Price (₹) *</label>
                <input required type="number" step="0.01" value={form.salePrice} onChange={(e) => f("salePrice", e.target.value)} placeholder="0.00" className="form-control" />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label mb-1">Discount (₹)</label>
                <input type="number" step="0.01" value={form.discount} onChange={(e) => f("discount", e.target.value)} placeholder="0.00" className="form-control" />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label mb-1">Tax (₹)</label>
                <input type="number" step="0.01" value={form.tax} onChange={(e) => f("tax", e.target.value)} placeholder="0.00" className="form-control" />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label mb-1">Bill No</label>
                <input value={form.billNo} onChange={(e) => f("billNo", e.target.value)} placeholder="INV-001" className="form-control" />
              </div>
            </div>

            <div className="alert alert-secondary mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Net Sale:</span>
                <span className="fw-medium">{formatINR(netSale)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Final Bill Amount:</span>
                <span className="text-success">{formatINR(finalBill)}</span>
              </div>
            </div>

                  <div className="d-flex justify-content-end pt-3 border-top mt-4">
                    <button type="submit" form="salesForm" disabled={saving || !autoSubLot} className="btn btn-primary d-flex align-items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? "Saving..." : "Save Sale"}
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
