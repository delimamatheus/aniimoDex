"use client";
import { useEffect, useState } from "react";
import { Aniimo, sprite } from "@/lib/aniimo";

// Box do jogo: 24 slots em formato de hexágono grande (4-5-6-5-4)
const ROWS = [4, 5, 6, 5, 4];
const PER_BOX = 24;
const KEY = "aniimo-caught-v1";
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
  const [caught, setCaught] = useState<Record<number, true>>({});
  const [box, setBox] = useState(0);
  const [focus, setFocus] = useState<Aniimo | null>(null);
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);

  const boxes = Math.max(1, Math.ceil(aniimo.length / PER_BOX));
  const page = aniimo.slice(box * PER_BOX, (box + 1) * PER_BOX);
  const countIn = (b: number) => aniimo.slice(b * PER_BOX, (b + 1) * PER_BOX).filter((a) => caught[a.id]).length;
  const total = Object.keys(caught).length;
  const shown = focus ?? page[0] ?? null;
  const go = (d: number) => setBox((b) => (b + d + boxes) % boxes);

  useEffect(() => {
    try { setCaught(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(caught)); } catch {}
  }, [caught, ready]);
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

  const toggle = (id: number) =>
    setCaught((c) => { const n = { ...c }; if (n[id]) delete n[id]; else n[id] = true; return n; });
  const togglePage = () => {
    const all = page.every((a) => caught[a.id]);
    setCaught((c) => { const n = { ...c }; page.forEach((a) => { if (all) delete n[a.id]; else n[a.id] = true; }); return n; });
  };

  let k = 0;
  return (
    <main className="stage">
      <div className="top">
        <span className="logo">Aniimo Dex</span>
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
        <div className="grid">
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
                    <img src={sprite(a)} alt="" />
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
            <p className="meta">#{pad(shown.id)} · {shown.element}</p>
            <div className="portrait"><img className={caught[shown.id] ? "" : "sil"} src={sprite(shown)} alt="" /></div>
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
        <button className="rel" onClick={() => { if (confirm("Apagar todo o progresso?")) setCaught({}); }}>Resetar</button>
      </footer>
    </main>
  );
}
