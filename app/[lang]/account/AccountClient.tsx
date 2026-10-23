"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

type Prof = { public: boolean; token: string | null; displayName: string };

export default function AccountClient({ initial, lang, t }: { initial: Prof; lang: Locale; t: Messages }) {
  const [p, setP] = useState<Prof>(initial);
  const [name, setName] = useState(initial.displayName);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const link = p.token && typeof window !== "undefined" ? `${location.origin}/${lang}/c/${p.token}` : "";

  async function save(body: object, ok: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/profile", { method: "PUT", body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const next = (await res.json()) as Prof;
      setP(next);
      setName(next.displayName);
      setMsg(ok);
    } catch {
      setMsg(t.saveFail);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setMsg(t.copied);
    } catch {
      setMsg(t.copyFail);
    }
  }

  async function del() {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error();
      try { localStorage.removeItem("aniimo-caught-v2"); localStorage.removeItem("aniimo-caught-v1"); } catch {}
      await signOut({ callbackUrl: `/${lang}` });
    } catch {
      setMsg(t.deleteFail);
      setBusy(false);
    }
  }

  return (
    <>
      <h2>{t.shareTitle}</h2>
      <p>{t.shareDesc}</p>
      <div className="row2">
        <label htmlFor="dn">{t.displayName}</label>
        <input id="dn" type="text" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn ghost" disabled={busy || !name.trim() || name.trim() === p.displayName}
          onClick={() => save({ displayName: name }, t.nameSaved)}>{t.saveName}</button>
      </div>
      <div className="row2">
        <label>
          <input type="checkbox" checked={p.public} disabled={busy}
            onChange={(e) => save({ public: e.target.checked }, e.target.checked ? t.publicEnabled : t.publicDisabled)} />{" "}
          {t.publicOn}
        </label>
      </div>
      {p.public && link && (
        <>
          <p>{t.yourLink} <a href={link}>{link}</a></p>
          <div className="row2">
            <button className="btn" onClick={copy}>{t.copyLink}</button>
            <button className="btn ghost" disabled={busy} onClick={() => save({ regenerate: true }, t.newLinkDone)}>{t.newLink}</button>
          </div>
        </>
      )}

      <h2>{t.signOutTitle}</h2>
      <div className="row2">
        <button className="btn ghost" onClick={() => signOut({ callbackUrl: `/${lang}` })}>{t.signOutBtn}</button>
      </div>

      <h2>{t.deleteTitle}</h2>
      <p>{t.deleteDesc}</p>
      {!confirmDel ? (
        <div className="row2"><button className="btn danger" onClick={() => setConfirmDel(true)}>{t.deleteBtn}</button></div>
      ) : (
        <div className="row2" role="group" aria-label={t.confirmDelete}>
          <b>{t.sure}</b>
          <button className="btn danger" disabled={busy} onClick={del}>{t.yesDelete}</button>
          <button className="btn ghost" disabled={busy} onClick={() => setConfirmDel(false)}>{t.cancel}</button>
        </div>
      )}

      <p role="status" aria-live="polite" className="muted">{msg}</p>
    </>
  );
}
