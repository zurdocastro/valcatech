"use client";
import { useRef, useEffect } from "react";
import { Bold, Italic, User } from "lucide-react";

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "7" },
];

// A lightweight contentEditable editor instead of a full library (Quill/Tiptap)
// since the only formatting an email campaign needs is bold, font size, and a
// button to insert a {{first_name}} merge tag (substituted per recipient at
// send time — see lib/emailTemplate.ts). The DOM is only synced from `value`
// on mount, never on every keystroke, so the caret never jumps mid-edit.
export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Mount-only: the parent modal fully unmounts this component on close, so
  // there's no case where `value` needs to be re-pushed into the DOM later.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emitChange() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  }

  function insertPlaceholder(token: string) {
    ref.current?.focus();
    document.execCommand("insertText", false, token);
    emitChange();
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={() => exec("bold")} style={toolbarBtn} title="Bold"><Bold size={14} /></button>
        <button type="button" onClick={() => exec("italic")} style={toolbarBtn} title="Italic"><Italic size={14} /></button>
        <select
          defaultValue="3"
          onChange={(e) => exec("fontSize", e.target.value)}
          style={{ ...toolbarBtn, width: "auto", paddingInline: 8 }}
          title="Font size"
        >
          {FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button type="button" onClick={() => insertPlaceholder("{{first_name}}")} style={{ ...toolbarBtn, width: "auto", paddingInline: 10, gap: 6, display: "inline-flex", alignItems: "center" }} title="Insert customer's first name">
          <User size={14} /> Insert name
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={emitChange}
        suppressContentEditableWarning
        style={{ minHeight: 160, border: "1.5px solid var(--line)", borderRadius: 8, padding: 12, fontSize: 14, outline: "none", lineHeight: 1.6 }}
      />
    </div>
  );
}

const toolbarBtn: React.CSSProperties = {
  width: 30, height: 30, border: "1.5px solid var(--line)", borderRadius: 6, background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13,
};
