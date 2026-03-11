"use client";

import { useState, useEffect } from "react";
import { Tag, Search, Loader2, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

type SubLot = {
  id: string;
  subLotNo: string;
  lot: { lotNo: string; itemName: string | null };
  weight: number;
  weightUnit: string;
  pieces: number | null;
  shape: string | null;
  size: string | null;
  lines: number | null;
  length: number | null;
  status: string;
};

export default function LabelsPage() {
  const [subLots, setSubLots] = useState<SubLot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SubLot | null>(null);
  const [shopName, setShopName] = useState("");
  const [labelType, setLabelType] = useState<"STOCK" | "RECEIVED">("STOCK");
  const [selectionMark, setSelectionMark] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/sublots?search=${search}`)
      .then((r) => r.json())
      .then((d) => { setSubLots(d.subLots || []); setLoading(false); });
  }, [search]);

  async function generatePDF() {
    if (!selected) return;
    setGenerating(true);

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [100, 70] });

    const pageW = 100;
    const pageH = 70;
    const padding = 6;

    // Header Bar
    doc.setFillColor(36, 67, 235);
    doc.rect(0, 0, pageW, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    if (shopName) {
      doc.text(shopName.toUpperCase(), pageW / 2, 8, { align: "center" });
    }
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(labelType === "STOCK" ? "STOCK LABEL" : "RECEIVED LABEL", pageW / 2, 14, { align: "center" });

    // Content
    doc.setTextColor(20, 20, 20);
    let y = 23;
    const col1 = padding;
    const col2 = pageW / 2 + 2;
    const lineH = 7;

    function row(label: string, value: string, col: number = col1) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 120);
      doc.text(label, col, y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 40);
      doc.text(value || "—", col, y + 4);
    }

    row("LOT NO", selected.lot.lotNo, col1);
    row("SUB LOT", selected.subLotNo, col2);
    y += lineH;
    if (selected.lot.itemName) {
      row("ITEM", selected.lot.itemName, col1);
      y += lineH;
    }
    row("WEIGHT", `${selected.weight} ${selected.weightUnit}`, col1);
    row("PIECES", String(selected.pieces || "—"), col2);
    y += lineH;
    row("SHAPE", selected.shape || "—", col1);
    row("SIZE", selected.size || "—", col2);
    y += lineH;
    if (selected.lines) {
      row("LINES", String(selected.lines), col1);
      row("LENGTH", selected.length ? `${selected.length}` : "—", col2);
      y += lineH;
    }

    if (labelType === "RECEIVED" && selectionMark) {
      doc.setFillColor(selectionMark === "SELECTION" ? 34 : 239, selectionMark === "SELECTION" ? 197 : 68, selectionMark === "SELECTION" ? 94 : 68);
      doc.roundedRect(padding, y - 2, 40, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(selectionMark, padding + 20, y + 3.5, { align: "center" });
    }

    // Footer
    doc.setFillColor(240, 242, 255);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${formatDate(new Date())}`, pageW / 2, pageH - 3, { align: "center" });

    doc.save(`label-${selected.lot.lotNo}-${selected.subLotNo}.pdf`);
    setGenerating(false);
  }

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-white mb-1" /> Label System
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Generate printable stock and received labels
          </p>
        </div>
      </div>

      <div className="row">
        {/* Left: Sub Lot Selector */}
        <div className="col-12 col-lg-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0">1. Select Sub Lot</h5>
            </div>
            <div className="card-body space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by lot or sub-lot..." className="form-control ps-5" />
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto mt-3">
                {loading ? (
                  <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
                ) : subLots.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No sub-lots found</p>
                ) : subLots.map((sl) => (
                  <button
                    key={sl.id}
                    onClick={() => setSelected(sl)}
                    className={`w-full text-start px-3 py-2.5 rounded text-sm transition-all border ${
                      selected?.id === sl.id
                        ? "bg-primary text-white border-primary"
                        : "border-transparent bg-light hover:bg-secondary hover:text-white"
                    }`}
                  >
                    <span className="font-monospace fw-bold">{sl.lot.lotNo}</span>
                    <span className={selected?.id === sl.id ? "text-white-50" : "text-muted"}> &rarr; {sl.subLotNo}</span>
                    <span className={`ms-2 text-xs ${selected?.id === sl.id ? "text-white-50" : "text-muted"}`}>({sl.weight} {sl.weightUnit})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Label Config & Preview */}
        <div className="col-12 col-lg-6 d-flex">
          <div className="card flex-fill w-100">
            <div className="card-header">
              <h5 className="card-title mb-0">2. Configure &amp; Preview</h5>
            </div>
            <div className="card-body space-y-4">
          {!selected ? (
            <div className="d-flex align-items-center justify-content-center h-52 text-muted small border-2 border-dashed rounded p-5">
              Select a sub-lot from the left
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label mb-1">Label Type</label>
                  <select value={labelType} onChange={(e) => setLabelType(e.target.value as "STOCK" | "RECEIVED")} className="form-select">
                    <option value="STOCK">Stock Label</option>
                    <option value="RECEIVED">Received Label</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label mb-1">Shop Name</label>
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Your shop name" className="form-control" />
                </div>
              </div>

              {labelType === "RECEIVED" && (
                <div className="mb-4">
                  <label className="form-label mb-1">Mark (Optional)</label>
                  <select value={selectionMark} onChange={(e) => setSelectionMark(e.target.value)} className="form-select">
                    <option value="">None</option>
                    <option value="SELECTION">✓ Selection</option>
                    <option value="REJECTION">✗ Rejection</option>
                  </select>
                </div>
              )}

              {/* Preview Card */}
              <div className="border border-primary border-opacity-25 border-dashed rounded p-4 bg-white text-dark mb-4">
                <div className="bg-primary text-white text-center py-2 rounded mb-3">
                  <p className="small fw-bold mb-0">{shopName || "[ SHOP NAME ]"}</p>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.7rem' }}>{labelType === "STOCK" ? "STOCK LABEL" : "RECEIVED LABEL"}</p>
                </div>
                <div className="row g-2" style={{ fontSize: '0.75rem' }}>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>LOT NO</p><p className="fw-bold mb-1">{selected.lot.lotNo}</p></div>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>SUB LOT</p><p className="fw-bold mb-1">{selected.subLotNo}</p></div>
                  {selected.lot.itemName && <div className="col-12"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>ITEM</p><p className="fw-medium mb-1">{selected.lot.itemName}</p></div>}
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>WEIGHT</p><p className="fw-medium mb-1">{selected.weight} {selected.weightUnit}</p></div>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>PIECES</p><p className="fw-medium mb-1">{selected.pieces || "—"}</p></div>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>SHAPE</p><p className="fw-medium mb-1">{selected.shape || "—"}</p></div>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>SIZE</p><p className="fw-medium mb-1">{selected.size || "—"}</p></div>
                  {selected.lines && <><div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>LINES</p><p className="fw-medium mb-1">{selected.lines}</p></div>
                  <div className="col-6"><p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>LENGTH</p><p className="fw-medium mb-1">{selected.length || "—"}</p></div></>}
                </div>
                {labelType === "RECEIVED" && selectionMark && (
                  <div className={`mt-2 text-center text-white fw-bold py-1 rounded ${selectionMark === "SELECTION" ? "bg-success" : "bg-danger"}`} style={{ fontSize: '0.75rem' }}>
                    {selectionMark}
                  </div>
                )}
              </div>

              <button
                onClick={generatePDF}
                disabled={generating}
                className="btn btn-primary w-100"
              >
                {generating ? <Loader2 className="w-4 h-4 me-2 animate-spin d-inline-block align-middle" /> : <Printer className="w-4 h-4 me-2 align-middle d-inline-block" />}
                {generating ? "Generating PDF..." : "Download PDF Label"}
              </button>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
