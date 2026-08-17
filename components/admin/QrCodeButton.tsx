"use client";
import { useState } from "react";
import QRCode from "qrcode";
import { QrCode, X, Download } from "lucide-react";
import { buildPromoCodeUrl } from "@/lib/qrCode";

// Scanning this QR takes a customer straight to the cart with the code
// already applied — same effect as typing it in, just faster on mobile.
export default function QrCodeButton({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState("");
  const url = buildPromoCodeUrl(code);

  async function show() {
    setOpen(true);
    if (!dataUrl) {
      const png = await QRCode.toDataURL(url, { width: 320, margin: 1 });
      setDataUrl(png);
    }
  }

  return (
    <>
      <button onClick={show} title="Show QR code" style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}>
        <QrCode size={14} />
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>QR for {code}</p>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt={`QR code for ${code}`} width={280} height={280} style={{ borderRadius: 8, border: "1px solid var(--line)" }} />
            ) : (
              <div style={{ width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Generating...</div>
            )}
            <p style={{ fontSize: 11.5, color: "var(--muted)", wordBreak: "break-all", marginTop: 14 }}>{url}</p>
            {dataUrl && (
              <a href={dataUrl} download={`${code}-qr.png`} className="btn-outline" style={{ marginTop: 14, padding: "8px 16px", fontSize: 13, display: "inline-flex" }}>
                <Download size={14} /> Download PNG
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
