"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

type Prof = { public: boolean; token: string | null; displayName: string };

export default function ContaClient({ initial }: { initial: Prof }) {
  const [p, setP] = useState<Prof>(initial);
  const [name, setName] = useState(initial.displayName);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const link = p.token && typeof window !== "undefined" ? `${location.origin}/c/${p.token}` : "";

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
      setMsg("Não foi possível salvar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setMsg("Link copiado.");
    } catch {
      setMsg("Não foi possível copiar automaticamente. Selecione o link e copie.");
    }
  }

  async function del() {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error();
      try { localStorage.removeItem("aniimo-caught-v2"); localStorage.removeItem("aniimo-caught-v1"); } catch {}
      await signOut({ callbackUrl: "/" });
    } catch {
      setMsg("Não foi possível excluir agora. Tente de novo.");
      setBusy(false);
    }
  }

  return (
    <>
      <h2>Compartilhar minha coleção</h2>
      <p>
        Gere um link para mostrar seu progresso a quem você quiser. Quem tiver o link vê o nome de exibição e quais Aniimo você marcou,
        sem poder alterar nada. A página não aparece em buscas.
      </p>
      <div className="row2">
        <label htmlFor="dn">Nome de exibição</label>
        <input id="dn" type="text" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn ghost" disabled={busy || !name.trim() || name.trim() === p.displayName}
          onClick={() => save({ displayName: name }, "Nome salvo.")}>Salvar nome</button>
      </div>
      <div className="row2">
        <label>
          <input type="checkbox" checked={p.public} disabled={busy}
            onChange={(e) => save({ public: e.target.checked }, e.target.checked ? "Link público ativado." : "Link público desativado.")} />{" "}
          Link público ativado
        </label>
      </div>
      {p.public && link && (
        <>
          <p>Seu link: <a href={link}>{link}</a></p>
          <div className="row2">
            <button className="btn" onClick={copy}>Copiar link</button>
            <button className="btn ghost" disabled={busy}
              onClick={() => save({ regenerate: true }, "Novo link gerado. O anterior deixou de funcionar.")}>Gerar novo link</button>
          </div>
        </>
      )}

      <h2>Sair</h2>
      <div className="row2">
        <button className="btn ghost" onClick={() => signOut({ callbackUrl: "/" })}>Sair da conta</button>
      </div>

      <h2>Excluir meus dados</h2>
      <p>Apaga seu progresso salvo e seu perfil público, e encerra a sessão. Não dá para desfazer.</p>
      {!confirmDel ? (
        <div className="row2"><button className="btn danger" onClick={() => setConfirmDel(true)}>Excluir meus dados…</button></div>
      ) : (
        <div className="row2" role="group" aria-label="Confirmar exclusão">
          <b>Tem certeza?</b>
          <button className="btn danger" disabled={busy} onClick={del}>Sim, excluir tudo</button>
          <button className="btn ghost" disabled={busy} onClick={() => setConfirmDel(false)}>Cancelar</button>
        </div>
      )}

      <p role="status" aria-live="polite" className="muted">{msg}</p>
    </>
  );
}
