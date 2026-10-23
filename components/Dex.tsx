"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import LangSwitch from "@/components/LangSwitch";
import { Aniimo, entryKey, sprite } from "@/lib/aniimo";
import { fmt, type Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

// Box do jogo: 24 slots em formato de hexágono grande (4-5-6-5-4)
const ROWS = [4, 5, 6, 5, 4];
const PER_BOX = 24;
const KEY = "aniimo-caught-v2";
const KEY_V1 = "aniimo-caught-v1"; // só havia o normal
const KEY_SC = "aniimo-shortcuts";
type Variant = "normal" | "umbral" | "shiny" | "prismana";
type Marks = Record<string, true>; // chave = entryKey(id, form)
type All = Record<Variant, Marks>;
type Op = { variant: Variant; add: string[]; remove: string[] };
const VARIANTS: { id: Variant; label: "vNormal" | "vUmbral" | "vShiny" | "vPrismana" }[] = [
  { id: "normal", label: "vNormal" },
  { id: "umbral", label: "vUmbral" },
  { id: "shiny", label: "vShiny" },
  { id: "prismana", label: "vPrismana" },
];
const ELEMENT_KEY: Record<string, keyof Messages> = {
  fire: "elFire", water: "elWater", grass: "elGrass", ice: "elIce", rock: "elRock",
  wind: "elWind", electric: "elElectric", dark: "elDark", holy: "elHoly",
};
const EMPTY: All = { normal: {}, umbral: {}, shiny: {}, prismana: {} };
const key = (a: Aniimo) => entryKey(a.id, a.form);
const pad = (n: number) => String(n).padStart(3, "0");
const toMarks = (r: Partial<Record<Variant, string[]>>): All => {
  const out: All = { normal: {}, umbral: {}, shiny: {}, prismana: {} };
  for (const { id } of VARIANTS) (r[id] ?? []).forEach((k) => (out[id][k] = true));
  return out;
};

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

type Props = {
  aniimo: Aniimo[];
  lang: Locale;
  t: Messages;
  // Coleção pública de outra pessoa (/c/<token>): somente leitura, sem login nem localStorage.
  readOnly?: { owner: string; caught: Partial<Record<Variant, string[]>> };
};

export default function Dex({ aniimo, lang, t, readOnly }: Props) {
  const tr = (k: keyof Messages, vars?: Record<string, string | number>) => fmt(t[k], vars);
  const [all, setAll] = useState<All>(() => (readOnly ? toMarks(readOnly.caught) : EMPTY));
  const [variant, setVariant] = useState<Variant>("normal");
  const [box, setBox] = useState(0);
  const [focus, setFocus] = useState<Aniimo | null>(null);
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(!!readOnly);
  const [user, setUser] = useState<string | null>(null); // nome do usuário logado
  const [loadErr, setLoadErr] = useState(false); // não foi possível saber/carregar o progresso salvo
  const [syncErr, setSyncErr] = useState(false); // há alterações que ainda não chegaram ao servidor
  const [shortcuts, setShortcuts] = useState(true);
  const [msg, setMsg] = useState(""); // anúncio para leitores de tela
  const queue = useRef<Op[]>([]);
  const flushing = useRef(false);

  // Prismana tem a própria lista; as demais mostram as básicas e, depois, as regionais (já em ordem).
  const list = useMemo(
    () => aniimo.filter((a) => (variant === "prismana") === (a.kind === "prismana")),
    [aniimo, variant],
  );
  const boxes = Math.max(1, Math.ceil(list.length / PER_BOX));
  const page = list.slice(box * PER_BOX, (box + 1) * PER_BOX);
  const caught = all[variant];
  const countIn = (b: number) => list.slice(b * PER_BOX, (b + 1) * PER_BOX).filter((a) => caught[key(a)]).length;
  const total = list.filter((a) => caught[key(a)]).length;
  const shown = (focus && list.some((a) => key(a) === key(focus)) ? focus : null) ?? page[0] ?? null;
  const locked = !!readOnly || loadErr; // sem alterações enquanto o progresso salvo não carregou
  const go = useCallback((d: number) => setBox((b) => (b + d + boxes) % boxes), [boxes]);
  const variantLabel = (v: Variant) => t[VARIANTS.find((x) => x.id === v)!.label];
  const elementOf = (a: Aniimo) =>
    a.elements.length ? a.elements.map((e) => (ELEMENT_KEY[e] ? t[ELEMENT_KEY[e]] : e)).join(" / ") : a.element;
  const fullName = (a: Aniimo) => (a.formLabel ? `${a.name} (${a.formLabel})` : a.name);

  // ---- Carregamento do progresso ----
  const load = useCallback(async () => {
    setLoadErr(false);
    let local: All = EMPTY;
    try {
      const v2 = localStorage.getItem(KEY);
      if (v2) local = { ...EMPTY, ...JSON.parse(v2) };
      else local = { ...EMPTY, normal: JSON.parse(localStorage.getItem(KEY_V1) || "{}") };
    } catch {}
    try {
      const res = await fetch("/api/caught");
      if (res.status === 401) return void setAll(local); // visitante: progresso só no navegador
      if (!res.ok) throw new Error(String(res.status));
      const { name, caught: remote } = (await res.json()) as { name: string; caught: Partial<Record<Variant, string[]>> };
      const merged = toMarks(remote);
      let uploaded = true;
      for (const { id: v } of VARIANTS) {
        // Primeiro login: sobe o progresso salvo no navegador.
        const extra = Object.keys(local[v] ?? {}).filter((k) => !merged[v][k]);
        if (!extra.length) continue;
        const up = await fetch("/api/caught", { method: "PUT", body: JSON.stringify({ variant: v, add: extra }) });
        if (up.ok) extra.forEach((k) => (merged[v][k] = true));
        else uploaded = false;
      }
      if (uploaded) try { localStorage.removeItem(KEY); localStorage.removeItem(KEY_V1); } catch {}
      setAll(merged);
      setUser(name || "·");
    } catch {
      setAll(local);
      setLoadErr(true);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    if (readOnly) return;
    load();
    try { setShortcuts(localStorage.getItem(KEY_SC) !== "off"); } catch {}
  }, [load, readOnly]);
  useEffect(() => {
    if (ready && !user && !loadErr && !readOnly) try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {}
  }, [all, ready, user, loadErr, readOnly]);

  // ---- Fila de sincronização: mantém a ordem e tenta de novo se a rede falhar ----
  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      while (queue.current.length) {
        const res = await fetch("/api/caught", { method: "PUT", body: JSON.stringify(queue.current[0]) });
        if (res.status === 400) queue.current.shift(); // inválida: reenviar não adianta
        else if (!res.ok) throw new Error(String(res.status));
        else queue.current.shift();
      }
      setSyncErr(false);
    } catch {
      setSyncErr(true);
    } finally {
      flushing.current = false;
    }
  }, []);
  useEffect(() => {
    const on = () => queue.current.length && flush();
    const warn = (e: BeforeUnloadEvent) => { if (queue.current.length) e.preventDefault(); };
    window.addEventListener("online", on);
    window.addEventListener("beforeunload", warn);
    return () => { window.removeEventListener("online", on); window.removeEventListener("beforeunload", warn); };
  }, [flush]);
  const sync = (add: string[], remove: string[]) => {
    if (!user || (!add.length && !remove.length)) return;
    queue.current.push({ variant, add, remove });
    flush();
  };

  // ---- Atalhos de teclado (podem ser desligados no rodapé: WCAG 2.1.4) ----
  useEffect(() => {
    if (!shortcuts) return;
    const f = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.ctrlKey || e.metaKey || e.altKey || el.closest("input, select, textarea, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "q" || k === "arrowleft") go(-1);
      if (k === "e" || k === "arrowright") go(1);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [shortcuts, go]);
  const setSc = (on: boolean) => {
    setShortcuts(on);
    try { localStorage.setItem(KEY_SC, on ? "on" : "off"); } catch {}
  };

  // ---- Marcações ----
  const mark = (fn: (m: Marks) => void) =>
    setAll((a) => { const m = { ...a[variant] }; fn(m); return { ...a, [variant]: m }; });
  const toggle = (a: Aniimo) => {
    if (locked) return;
    const k = key(a);
    const had = !!caught[k];
    mark((m) => { if (had) delete m[k]; else m[k] = true; });
    sync(had ? [] : [k], had ? [k] : []);
    setMsg(tr(had ? "annUnmarked" : "annMarked", { name: fullName(a) }));
  };
  const togglePage = () => {
    if (locked) return;
    const every = page.every((a) => caught[key(a)]);
    const keys = page.map(key);
    mark((m) => keys.forEach((k) => { if (every) delete m[k]; else m[k] = true; }));
    sync(every ? [] : keys, every ? keys : []);
    setMsg(tr(every ? "annPageNone" : "annPageAll", { n: box + 1 }));
  };
  const reset = () => {
    if (locked || !confirm(tr("resetConfirm", { variant: variantLabel(variant) }))) return;
    const ids = Object.keys(caught);
    setAll((a) => ({ ...a, [variant]: {} }));
    sync([], ids);
    setMsg(tr("annReset", { variant: variantLabel(variant) }));
  };
  const pickVariant = (v: Variant) => {
    setVariant(v); setBox(0); setFocus(null);
    setMsg(tr("annVariant", { variant: variantLabel(v) }));
  };
  const pickBox = (b: number) => { setBox(b); setMsg(tr("storageN", { n: b + 1 })); };
  const keyHint = (k: string) => (shortcuts ? tr("keyHint", { k }) : "");
  const signIn = () => { location.href = `/${lang}/signin?callbackUrl=${encodeURIComponent(location.pathname)}`; };

  let k = 0;
  return (
    <div className="stage">
      <header className="top">
        <h1 className="logo">Aniimo Dex</h1>
        <fieldset className="variants">
          <legend className="sr-only">{t.variantsLegend}</legend>
          {VARIANTS.map((v) => (
            <label key={v.id} className={"vr " + v.id + (variant === v.id ? " on" : "")}>
              <input type="radio" name="variant" value={v.id} checked={variant === v.id} onChange={() => pickVariant(v.id)} />
              {t[v.label]}
            </label>
          ))}
        </fieldset>
        <LangSwitch lang={lang} label={t.language} />
        {!readOnly && (
          <span className="acct">
            {user ? (
              <>
                <Link href={`/${lang}/account`}>{user}</Link>
                <button onClick={() => signOut({ redirect: false }).then(() => location.reload())}>{t.signOut}</button>
              </>
            ) : (
              <button onClick={signIn}>{t.signIn}</button>
            )}
          </span>
        )}
        <input className="search" type="search" placeholder={t.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.searchLabel} />
      </header>

      <div className="banners">
        {readOnly && (
          <p className="banner info">
            {tr("sharedBanner", { owner: readOnly.owner })} <Link href={`/${lang}`}>{t.sharedCta}</Link>
          </p>
        )}
        {loadErr && (
          <p className="banner err" role="alert">
            {t.loadErr} <button onClick={load}>{t.retry}</button>
          </p>
        )}
        {syncErr && (
          <p className="banner err" role="alert">
            {t.syncErr} <button onClick={flush}>{t.retryShort}</button>
          </p>
        )}
        {!ready && <p className="banner info" role="status">{t.loading}</p>}
      </div>

      <nav className="side" aria-label={t.storages}>
        {Array.from({ length: boxes }, (_, b) => (
          <button key={b} className={"st" + (b === box ? " sel" : "")} onClick={() => pickBox(b)}
            aria-current={b === box ? "page" : undefined} aria-label={tr("storageAria", { n: b + 1, c: countIn(b), t: PER_BOX })}>
            <span className="stw" aria-hidden><Hex /><b>{countIn(b)}</b></span>
            <span aria-hidden>{tr("storageN", { n: b + 1 })}</span>
          </button>
        ))}
      </nav>

      <main className="center" id="main" tabIndex={-1}>
        <button className="arrow l" onClick={() => go(-1)} aria-label={t.prevStorage + keyHint("Q")}>‹<small aria-hidden>Q</small></button>
        <div className={"grid v-" + variant} role="group"
          aria-label={tr("gridAria", { n: box + 1, total: boxes, variant: variantLabel(variant), c: countIn(box), t: PER_BOX })}>
          {ROWS.map((n, r) => (
            <div className="row" key={r}>
              {Array.from({ length: n }, (_, i) => {
                const a = page[k++];
                if (!a) return <div key={`e${r}-${i}`} className="slot empty" aria-hidden><Hex /><Face /></div>;
                const ak = key(a);
                const dim = q && !a.name.toLowerCase().includes(q.toLowerCase()) && String(a.id) !== q;
                const cls = "slot" + (caught[ak] ? " got" : "") + (shown && key(shown) === ak ? " sel" : "") + (dim ? " dim" : "");
                const state = caught[ak] ? t.slotCaught : t.slotNotCaught;
                return (
                  <button key={ak} className={cls} title={fullName(a)}
                    aria-pressed={readOnly ? undefined : !!caught[ak]}
                    aria-disabled={locked || undefined}
                    aria-label={tr("slotAria", { id: a.id, name: fullName(a), element: elementOf(a) }) + (readOnly ? `, ${state}` : "")}
                    onClick={() => { toggle(a); setFocus(a); }}
                    onMouseEnter={() => setFocus(a)} onFocus={() => setFocus(a)}>
                    <Hex />
                    <span className="fx" aria-hidden /><span className="spr" aria-hidden><img src={sprite(a)} alt="" /></span>
                    <span className="tag" aria-hidden>{pad(a.id)}</span>
                    {a.kind === "regional" && <i className="rg" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <button className="arrow r" onClick={() => go(1)} aria-label={t.nextStorage + keyHint("E")}>›<small aria-hidden>E</small></button>
      </main>

      <aside className="panel" aria-label={t.panelAria}>
        {shown && (
          <>
            <h2>{shown.name}</h2>
            {shown.formLabel && <p className="form">{shown.formLabel}</p>}
            <p className="meta">#{pad(shown.id)} · {elementOf(shown)}{shown.stage ? ` · ${tr("stageN", { n: shown.stage })}` : ""}</p>
            <div className="portrait">
              <img className={caught[key(shown)] ? "" : "sil"} src={sprite(shown)} alt={tr("portraitAlt", { name: fullName(shown) })} />
            </div>
            {shown.description && <p className="desc">{shown.description}</p>}
            <p className={"status" + (caught[key(shown)] ? " ok" : "")}>{caught[key(shown)] ? t.caught : t.notCaught}</p>
            {!readOnly && (
              <button className="act" onClick={() => toggle(shown)} disabled={locked}>
                {caught[key(shown)] ? t.unmark : t.markCaught}
              </button>
            )}
          </>
        )}
      </aside>

      <section className="bar" aria-label={t.barAria}>
        <span><b>Aniimo Dex</b> · {tr("caughtOf", { c: total, t: list.length })}</span>
        <span className="mid">
          <select value={box} onChange={(e) => pickBox(Number(e.target.value))} aria-label={t.goToStorage}>
            {Array.from({ length: boxes }, (_, b) => <option key={b} value={b}>{tr("storageN", { n: b + 1 })}</option>)}
          </select>
          <span>{countIn(box)}/{PER_BOX}</span>
          {!readOnly && <button onClick={togglePage} disabled={locked}>{t.markPage}</button>}
          <label className="sc">
            <input type="checkbox" checked={shortcuts} onChange={(e) => setSc(e.target.checked)} /> {t.shortcuts}
          </label>
        </span>
        {!readOnly && <button className="rel" onClick={reset} disabled={locked}>{t.reset}</button>}
      </section>

      <footer className="legal">
        <p>
          {t.fanBefore}
          <a href="https://wiki.aniimo.com" target="_blank" rel="noopener noreferrer">wiki.aniimo.com<span className="sr-only">{t.opensNewTab}</span></a>
          {t.fanAfter}
        </p>
        <nav aria-label={t.legalNav}>
          <Link href={`/${lang}/privacy`}>{t.privacy}</Link>
          <Link href={`/${lang}/legal`}>{t.legalNotice}</Link>
          {user && <Link href={`/${lang}/account`}>{t.myAccount}</Link>}
        </nav>
      </footer>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{msg}</div>
    </div>
  );
}
