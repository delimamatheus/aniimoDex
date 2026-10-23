"use client";
import { useState } from "react";

export default function PixCopy({ code, label, okText, failText, codeLabel }: { code: string; label: string; okText: string; failText: string; codeLabel: string }) {
  const [msg, setMsg] = useState("");
  return (
    <>
      <p className="muted">{codeLabel}</p>
      <p><code className="pixcode">{code}</code></p>
      <div className="row2">
        <button
          className="btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setMsg(okText);
            } catch {
              setMsg(failText);
            }
          }}
        >
          {label}
        </button>
      </div>
      <p role="status" aria-live="polite" className="muted">{msg}</p>
    </>
  );
}
