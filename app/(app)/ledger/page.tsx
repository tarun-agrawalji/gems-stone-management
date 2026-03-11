"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type LedgerEntry = {
  id: string;
  createdAt: string;
  product: { name: string } | null;
  transactionType: string;
  quantity: number;
  referenceId: string;
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refType, setRefType] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (refType) params.set("transactionType", refType);
    const r = await fetch(`/api/ledger?${params}`);
    const data = await r.json();
    setEntries(data.entries || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [refType]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white mb-1" /> Stock Movement Ledger
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Complete audit trail of all stock movements · {total} entries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row">
            <div className="col-auto">
              <select value={refType} onChange={(e) => setRefType(e.target.value)} className="form-select w-auto">
                <option value="">All Types</option>
                <option value="PURCHASE">Purchase</option>
                <option value="MANUFACTURING_ISSUE">Mfg Issue</option>
                <option value="MANUFACTURING_RECEIPT">Mfg Receipt</option>
                <option value="SALE">Sale</option>
                <option value="REJECTION">Rejection</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card flex-fill w-100">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Date</th><th>Product</th>
                <th>Quantity</th><th>Type</th><th>Ref ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No ledger entries yet. Ledger is auto-populated on transactions.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td><span className="font-monospace text-primary fw-medium">{e.product?.name || "—"}</span></td>
                  <td>
                    <span className={e.quantity > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {e.quantity > 0 ? "+" : ""}{e.quantity}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {e.transactionType}
                    </span>
                  </td>
                  <td><span className="font-monospace small text-muted">{e.referenceId}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
