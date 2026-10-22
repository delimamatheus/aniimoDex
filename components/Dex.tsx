"use client";
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Aniimo, sprite } from "@/lib/aniimo";

// Box do jogo: 24 slots em formato de hexágono grande (4-5-6-5-4)
const ROWS = [4, 5, 6, 5, 4];
const PER_BOX = 24;
const KEY = "aniimo-caught-v2";
const KEY_V1 = "aniimo-caught-v1"; // só havia o normal
type Variant = "normal" | "umbral" | "shiny";
type Marks = Record<number, true>;
type All = Record<Variant, Marks>;
const VARIANTS: { id: Variant; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "umbral", label: "Umbral" },
  { id: "shiny", label: "Cintilante" },
];
const EMPTY: All = { normal: {}, umbral: {}, shiny: {} };
const pad = (n: number) => String(n).padStart(3, "0");

function Hex() {
  return (
    <svg className="hex" viewBox="0 0 100 114" preserveAspectRatio="none" aria-hidden>
      <polygon points="50,8 92,32 92,82 50,106 8,82 8,32" />
    </svg>
  );
}

function Face() {
  return (
    <svg className="face" viewBox="0 0 40 40" aria-hidden>
      <path d="M8 14 12 6 18 11h4l6-5 4 8q3 6 0 13-4 7-12 7T8 27q-3-7 0-13Z" />
      <circle cx="15" cy="21" r="2" fill="#bcd0de" />
      <circle cx="25" cy="21" r="2" fill="#bcd0de" />
    </svg>
  );
}

export default function Dex({ aniimo }: { aniimo: Aniimo[] }) {
  const [all, setAll] = useState<All>(EMPTY);
  const [variant, setVariant] = useState<Variant>("normal");
  const [box, setBox] = useState(0);
  const [focus, setFocus] = useState<Aniimo | null>(null);
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null); // nome do usuário logado

  const boxes = Math.max(1, Math.ceil(aniimo.length / PER_BOX));
  const page = aniimo.slice(box * PER_BOX, (box + 1) * PER_BOX);
  const caught = all[variant];
  const countIn = (b: number) => aniimo.slice(b * PER_BOX, (b + 1) * PER_BOX).filter((a) => caught[a.id]).length;
  const total = Object.keys(caught).length;
  const shown = focus ?? page[0] ?? null;
  const go = (d: number) => setBox((b) => (b + d + boxes) % boxes);

  useEffect(() => {
    let local: All = EMPTY;
    try {
      const v2 = localStorage.getItem(KEY);
      if (v2) local = { ...EMPTY, ...JSON.parse(v2) };
      else local = { ...EMPTY, normal: JSON.parse(localStorage.getItem(KEY_V1) || "{}") };
    } catch {}
    (async () => {
      try {
        const res = await fetch("/api/caught");
        if (res.ok) {
          const { name, caught: remote } = (await res.json()) as { name: string; caught: Record<Variant, number[]> };
          const merged: All = { normal: {}, umbral: {}, shiny: {} };
          let uploaded = true;
          for (const { id: v } of VARIANTS) {
            (remote[v] ?? []).forEach((id) => (merged[v][id] = true));
            // Primeiro login: sobe o progresso salvo no navegador.
            const extra = Object.keys(local[v] ?? {}).map(Number).filter((id) => !merged[v][id]);
            if (!extra.length) continue;
            const up = await fetch("/api/caught", { method: "PUT", body: JSON.stringify({ variant: v, add: extra }) });
            if (up.ok) extra.forEach((id) => (merged[v][id] = true));
            else uploaded = false;
          }
          if (uploaded) try { localStorage.removeItem(KEY); localStorage.removeItem(KEY_V1); } catch {}
          setAll(merged);
          setUser(name || "Conta");
          return;
        }
      } catch {}
      setAll(local);
    })().finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready && !user) try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {}
  }, [all, ready, user]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const k = e.key.toLowerCase();
      if (k === "q" || k === "arrowleft") go(-1);
      if (k === "e" || k === "arrowright") go(1);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  const sync = (add: number[], remove: number[]) => {
    if (!user || (!add.length && !remove.length)) return;
    fetch("/api/caught", { method: "PUT", body: JSON.stringify({ variant, add, remove }) }).catch(() => {});
  };
  const mark = (fn: (m: Marks) => void) =>
    setAll((a) => { const m = { ...a[variant] }; fn(m); return { ...a, [variant]: m }; });
  const toggle = (id: number) => {
    const had = !!caught[id];
    mark((m) => { if (had) delete m[id]; else m[id] = true; });
    sync(had ? [] : [id], had ? [id] : []);
  };
  const togglePage = () => {
    const every = page.every((a) => caught[a.id]);
    const ids = page.map((a) => a.id);
    mark((m) => ids.forEach((id) => { if (every) delete m[id]; else m[id] = true; }));
    sync(every ? [] : ids, every ? ids : []);
  };

  const reset = () => {
    const label = VARIANTS.find((v) => v.id === variant)!.label;
    if (!confirm(`Apagar o progresso de ${label}?`)) return;
    const ids = Object.keys(caught).map(Number);
    setAll((a) => ({ ...a, [variant]: {} }));
    sync([], ids);
  };

  let k = 0;
  return (
    <main className="stage">
      <div className="top">
        <span className="logo">Aniimo Dex</span>
        <div className="variants" role="radiogroup" aria-label="Tipo de Aniimo">
          {VARIANTS.map((v) => (
            <label key={v.id} className={"vr " + v.id + (variant === v.id ? " on" : "")}>
              <input type="radio" name="variant" value={v.id} checked={variant === v.id} onChange={() => setVariant(v.id)} />
              {v.label}
            </label>
          ))}
        </div>
        <span className="acct">
          {user ? (
            <>
              <span>{user}</span>
              <button onClick={() => signOut({ redirect: false }).then(() => location.reload())}>Sair</button>
            </>
          ) : (
            <button onClick={() => signIn()}>Entrar</button>
          )}
        </span>
        <input className="search" placeholder="Buscar Aniimo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
      </div>

      <nav className="side" aria-label="Storages">
        {Array.from({ length: boxes }, (_, b) => (
          <button key={b} className={"st" + (b === box ? " sel" : "")} onClick={() => setBox(b)}>
            <span className="stw"><Hex /><b>{countIn(b)}</b></span>
            <span>Storage {b + 1}</span>
          </button>
        ))}
      </nav>

      <section className="center">
        <button className="arrow l" onClick={() => go(-1)} aria-label="Box anterior">‹<small>Q</small></button>
        <div className={"grid v-" + variant}>
          {ROWS.map((n, r) => (
            <div className="row" key={r}>
              {Array.from({ length: n }, (_, i) => {
                const a = page[k++];
                if (!a) return <div key={`e${r}-${i}`} className="slot empty"><Hex /><Face /></div>;
                const dim = q && !a.name.toLowerCase().includes(q.toLowerCase()) && String(a.id) !== q;
                const cls = "slot" + (caught[a.id] ? " got" : "") + (shown?.id === a.id ? " sel" : "") + (dim ? " dim" : "");
                return (
                  <button key={a.id} className={cls} aria-pressed={!!caught[a.id]}
                    aria-label={`${a.name}, ${caught[a.id] ? "capturado" : "não capturado"}`}
                    onClick={() => { toggle(a.id); setFocus(a); }}
                    onMouseEnter={() => setFocus(a)} onFocus={() => setFocus(a)}>
                    <Hex />
                    <span className="fx" /><span className="spr"><img src={sprite(a)} alt="" /></span>
                    <span className="tag">{pad(a.id)}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <button className="arrow r" onClick={() => go(1)} aria-label="Próxima box">›<small>E</small></button>
      </section>

      <aside className="panel">
        {shown && (
          <>
            <h2>{shown.name}</h2>
            <p className="meta">#{pad(shown.id)} · {shown.element}{shown.stage ? ` · Estágio ${shown.stage}` : ""}</p>
            <div className="portrait"><img className={caught[shown.id] ? "" : "sil"} src={sprite(shown)} alt="" /></div>
            {shown.description && <p className="desc">{shown.description}</p>}
            <p className={"status" + (caught[shown.id] ? " ok" : "")}>{caught[shown.id] ? "Capturado" : "Não capturado"}</p>
            <button className="act" onClick={() => toggle(shown.id)}>
              {caught[shown.id] ? "Desmarcar" : "Marcar como capturado"}
            </button>
          </>
        )}
      </aside>

      <footer className="bar">
        <span><b>Aniimo Dex</b> · {total}/{aniimo.length} capturados</span>
        <span className="mid">
          <select value={box} onChange={(e) => setBox(Number(e.target.value))} aria-label="Storage">
            {Array.from({ length: boxes }, (_, b) => <option key={b} value={b}>Storage {b + 1}</option>)}
          </select>
          <span>{countIn(box)}/{PER_BOX}</span>
          <button onClick={togglePage}>Marcar página toda</button>
        </span>
        <button className="rel" onClick={() => reset()}>Resetar</button>
      </footer>
    </main>
  );
}
