import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 16, padding: "8px 0" }}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-outline"
        style={{ padding: "6px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, opacity: page <= 1 ? 0.5 : 1 }}
      >
        <ChevronLeft size={14} /> Previous
      </button>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {totalPages}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-outline"
        style={{ padding: "6px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, opacity: page >= totalPages ? 0.5 : 1 }}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}
