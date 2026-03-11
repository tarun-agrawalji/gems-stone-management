"use client";

import { useState, useEffect } from "react";
import { History, Search, Loader2, Wrench, TrendingUp, GitBranch, DollarSign, PackageOpen, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, X } from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function ProductHistoryPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory("");
  }, []);

  async function fetchHistory(query: string) {
    setError("");
    setLoading(true);
    try {
      const qs = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
      const r = await fetch(`/api/product-history${qs}`);
      if (r.ok) {
        const result = await r.json();
        setData(result);
      } else {
        const d = await r.json();
        setError(d.error || "Not found");
        setData(null);
      }
    } catch (err) {
      setError("Failed to fetch product history");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchHistory(search);
  }

  function handleClear() {
    setSearch("");
    fetchHistory("");
  }

  const lot = data?.lot;
  const metrics = data?.metrics;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <History className="w-5 h-5 text-white mb-1" /> Product History (Sum Up)
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Full lifecycle view from Purchase to Sales
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <form onSubmit={handleSearch} className="row g-3 items-end">
            <div className="col-12 col-md-auto mb-1">
              <label className="form-label mb-1">Enter Lot. No or Sub Lot No.</label>
              <div className="input-group">
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. L001 or L001-S1"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-md-auto d-flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin d-inline" />}
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="btn btn-light"
                >
                  Clear
                </button>
              )}
            </div>
            {error && <div className="col-12"><p className="text-danger small mt-2 mb-0">⚠ {error}</p></div>}
          </form>
        </div>
      </div>

      {/* Results */}
      {data?.type === "all" && data.lots && (
        <div className="card flex-fill w-100 mb-3">
          <div className="card-header d-flex align-items-center justify-content-between">
             <h5 className="card-title mb-0">All Products (Lots) Summary</h5>
             <span className="small text-muted">{data.lots.length} records</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover my-0">
              <thead>
                <tr>
                  <th>Lot No</th>
                  <th>Item / Category</th>
                  <th>Total Cost</th>
                  <th>Total Revenue</th>
                  <th>Net Profit</th>
                  <th>Avail. Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.lots.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">No lots found.</td></tr>
                ) : data.lots.map((l: any) => (
                  <tr key={l.id}>
                    <td><span className="font-monospace text-primary fw-medium">{l.lotNo}</span></td>
                    <td>
                      <div className="fw-medium small mb-0">{l.itemName || "—"}</div>
                      <div className="small text-muted text-uppercase mb-0">{l.category}</div>
                    </td>
                    <td>{formatINR(l.totalProductCost)}</td>
                    <td>{formatINR(l.totalRevenue)}</td>
                    <td className={`fw-bold ${l.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                      {formatINR(l.netProfit)}
                    </td>
                    <td><span className="fw-medium">{l.currentAvailableWeight}</span> <span className="small text-muted">GM</span></td>
                    <td>
                      <button 
                        onClick={() => { setSearch(l.lotNo); fetchHistory(l.lotNo); }} 
                        className="btn btn-sm btn-light"
                      >
                        <History className="w-4 h-4 text-muted d-inline me-1 mb-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.type !== "all" && lot && metrics && (
        <div className="row mb-3">
          {/* Top Level Metrics Cards */}
          <div className="col-12 col-sm-6 col-xxl-3 d-flex">
            <div className="card flex-fill border-start border-4 border-warning">
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0">
                    <h5 className="card-title text-muted text-uppercase mb-2">Total Product Cost</h5>
                  </div>
                </div>
                <h1 className="mt-1 mb-2 text-dark font-monospace">{formatINR(metrics.totalProductCost)}</h1>
                <div className="small text-muted mb-0">Purchase: {formatINR(metrics.totalPurchaseCost)} | Mfg: {formatINR(metrics.totalManufacturingCost)}</div>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-sm-6 col-xxl-3 d-flex">
            <div className="card flex-fill border-start border-4 border-primary">
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0">
                    <h5 className="card-title text-muted text-uppercase mb-2">Total Revenue</h5>
                  </div>
                </div>
                <h1 className="mt-1 mb-2 text-dark font-monospace">{formatINR(metrics.totalRevenue)}</h1>
                <div className="small text-muted mb-0">From {lot.subLots.reduce((acc: number, sl: any) => acc + sl.sales.length, 0)} Sale(s)</div>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-sm-6 col-xxl-3 d-flex">
            <div className="card flex-fill border-start border-4 border-success">
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0">
                    <h5 className="card-title text-muted text-uppercase mb-2">Net Profit</h5>
                  </div>
                </div>
                <h1 className={`mt-1 mb-2 font-monospace fw-bold ${metrics.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                  {formatINR(metrics.netProfit)}
                </h1>
                <div className="small text-muted mb-0">Revenue - Total Cost</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xxl-3 d-flex">
            <div className="card flex-fill border-start border-4 border-info relative overflow-hidden">
              <PackageOpen className="w-16 h-16 position-absolute end-0 bottom-0 text-info opacity-10" />
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0">
                    <h5 className="card-title text-muted text-uppercase mb-2">Available Balance</h5>
                  </div>
                </div>
                <h1 className="mt-1 mb-2 text-dark font-monospace">{metrics.currentAvailableWeight} <span className="fs-6 text-muted font-sans">GM</span></h1>
                <div className="small text-muted mb-0">In Stock or Ready</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && data.type !== "all" && lot && metrics && (
        <div className="row">
            
            {/* Left Column: Purchase & Manufacturing */}
            <div className="space-y-6">
              
              {/* Purchase Details */}
              <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2 text-primary">
                    <ArrowDownToLine className="w-4 h-4" /> Purchase Details
                  </h3>
                   <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">{lot.category}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lot Number</span>
                      <p className="font-mono text-lg font-bold">{lot.lotNo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Supplier Name</span>
                      <p className="font-medium text-sm mt-1">{lot.supplierName || "—"}</p>
                    </div>
                  </div>
                  
                  {lot.purchases.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No purchase records found.</p>
                  ) : (
                    <div className="space-y-3">
                      {lot.purchases.map((p: any) => (
                        <div key={p.id} className="bg-secondary/20 p-3 rounded-lg border border-border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-muted-foreground">{formatDate(p.date)}</span>
                            <span className="font-mono text-sm font-bold">{formatINR(p.totalCost)}</span>
                          </div>
                           <div className="grid grid-cols-3 gap-2 text-xs">
                             <div><span className="text-muted-foreground">Gross:</span> <span className="font-medium">{p.grossWeight} {p.weightUnit}</span></div>
                             <div><span className="text-muted-foreground">Less:</span> <span className="font-medium">{p.lessWeight} {p.weightUnit}</span></div>
                             <div><span className="text-muted-foreground">Net:</span> <span className="font-medium">{p.netWeight} {p.weightUnit}</span></div>
                           </div>
                           {(p.pieces || p.size || p.shape) && (
                              <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex gap-3">
                                {p.pieces && <span>Pieces: {p.pieces}</span>}
                                {p.shape && <span>Shape: {p.shape}</span>}
                                {p.size && <span>Size: {p.size}</span>}
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

               {/* Manufacturing Details */}
               <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-amber-500/10 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-amber-500">Manufacturing Timeline</h3>
                </div>
                <div className="p-5">
                   {lot.subLots.flatMap((sl: any) => sl.manufacturing).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No manufacturing records found.</p>
                   ) : (
                     <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-500/20 before:to-transparent">
                       {lot.subLots.flatMap((sl: any) => sl.manufacturing.map((m: any) => ({...m, subLotNo: sl.subLotNo}))).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((m: any) => (
                          <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-amber-500 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                             <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-secondary/20 p-3 rounded-xl border border-border shadow-sm">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-bold text-amber-500">{m.entryType}</span>
                                 <span className="text-[10px] text-muted-foreground">{formatDate(m.date)}</span>
                               </div>
                               <p className="text-xs font-medium mb-1">Sub Lot: <span className="font-mono text-primary">{m.subLotNo}</span></p>
                               <div className="text-[10px] text-muted-foreground grid grid-cols-2 gap-y-1">
                                  <span>Weight: {m.weight} {m.weightUnit}</span>
                                  <span>To: {m.issuedTo || "—"}</span>
                                  <span className="col-span-2 text-amber-500/80 font-medium">Cost: +{formatINR(m.totalManufacturingCost)}</span>
                               </div>
                             </div>
                          </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>

            </div>

             {/* Right Column: Splits & Sales */}
             <div className="space-y-6">
                
                {/* Sub Lot Tree */}
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-violet-500/10 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2 text-violet-400">
                      <GitBranch className="w-4 h-4" /> Sub-Lot Stock Directory
                    </h3>
                  </div>
                  <div className="p-5">
                    {lot.subLots.length === 0 ? (
                       <p className="text-sm text-muted-foreground italic">No sub-lots created yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {lot.subLots.map((sl: any) => (
                          <div key={sl.id} className="bg-secondary/30 p-3 rounded-lg border border-border flex items-center justify-between group hover:bg-secondary/50 transition-colors">
                             <div className="flex items-center gap-3">
                               <PackageOpen className="w-5 h-5 text-violet-400 opacity-50 flex-shrink-0" />
                               <div>
                                 <p className="font-mono font-bold text-sm">{sl.subLotNo}</p>
                                 <p className="text-[10px] text-muted-foreground">{sl.weight} {sl.weightUnit} · {sl.pieces || 0} Pieces</p>
                               </div>
                             </div>
                             <div className="text-right flex flex-col items-end gap-1">
                                <span className={`status-badge !text-[10px] !py-0.5 ${getStatusColor(sl.status)}`}>{getStatusLabel(sl.status)}</span>
                                {sl.parentSubLotId && (
                                   <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                     <GitBranch className="w-2.5 h-2.5" /> Split from parent
                                   </span>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales & Returns */}
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-blue-500/10 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2 text-blue-400">
                      <ArrowUpFromLine className="w-4 h-4" /> Sales & Returns
                    </h3>
                  </div>
                  <div className="p-5">
                     {lot.subLots.flatMap((sl: any) => sl.sales).length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No sales records found.</p>
                     ) : (
                       <div className="space-y-3">
                         {lot.subLots.flatMap((sl: any) => sl.sales.map((s: any) => ({...s, subLotNo: sl.subLotNo}))).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((s: any) => (
                            <div key={s.id} className="bg-secondary/20 p-3 rounded-lg border border-border border-l-2 border-l-blue-500">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold text-blue-400 mr-2">SALE</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(s.date)}</span>
                                  </div>
                                 <span className="font-mono text-sm font-bold text-emerald-400">+{formatINR(s.finalBillAmount)}</span>
                               </div>
                               <p className="text-xs font-medium mb-1 truncate">
                                 Sub Lot: <span className="font-mono">{s.subLotNo}</span> · Sold to: {s.soldTo || "—"}
                               </p>
                               
                               <div className="text-[10px] text-muted-foreground flex gap-3 mt-2 pt-2 border-t border-border/50">
                                 {s.weight && <span>Weight: {s.weight} {s.weightUnit}</span>}
                                 {s.discount > 0 && <span className="text-amber-500/80">Discount: {formatINR(s.discount)}</span>}
                               </div>

                               {s.status === "RETURNED" && (
                                 <div className="mt-2 bg-destructive/10 border border-destructive/20 rounded p-2 flex items-center gap-2 text-xs text-destructive">
                                   <RefreshCcw className="w-3 h-3" />
                                   Customer returned {s.returnedWeight} {s.weightUnit} on {formatDate(s.returnDate)}
                                 </div>
                               )}
                              </div>
                           ))}
                         </div>
                       )}
                   </div>
                 </div>
               </div>
            </div>
        )}
    </div>
  );
}
