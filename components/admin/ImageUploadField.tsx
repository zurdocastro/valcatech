"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { X, Image as ImageIcon } from "lucide-react";

export default function ImageUploadField({ label, value, onChange, folder = "email-campaigns" }: { label: string; value: string; onChange: (url: string) => void; folder?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(`${folder}/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(blob.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 10, display: "block", border: "1px solid var(--line)" }} />
          <button type="button" onClick={() => onChange("")} style={{ position: "absolute", top: 6, right: 6, background: "rgba(26,16,36,0.7)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-outline" style={{ padding: "10px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ImageIcon size={15} /> {uploading ? "Uploading..." : "Upload image"}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleChange} style={{ display: "none" }} />
    </div>
  );
}
