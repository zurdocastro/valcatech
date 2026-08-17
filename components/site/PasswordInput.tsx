"use client";

import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        style={{ ...style, paddingRight: 42, width: "100%" }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          display: "flex",
          padding: 2,
        }}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
