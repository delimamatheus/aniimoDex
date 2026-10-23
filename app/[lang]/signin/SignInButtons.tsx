"use client";
import { signIn } from "next-auth/react";

export default function SignInButtons({ items, callbackUrl }: { items: { id: string; label: string }[]; callbackUrl: string }) {
  return (
    <div className="row2">
      {items.map((p) => (
        <button key={p.id} className="btn" onClick={() => signIn(p.id, { callbackUrl })}>{p.label}</button>
      ))}
    </div>
  );
}
