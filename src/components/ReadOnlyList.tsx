"use client";

import Image from "next/image";
import type { GroceryItem } from "@/lib/types";
import { useSpicy } from "./SpicyMode";

type PublicItem = Pick<
  GroceryItem,
  "id" | "title" | "note" | "photoUrl" | "checked" | "spicy" | "sortOrder" | "updatedAt"
>;

export function ReadOnlyList({
  displayName,
  items,
}: {
  displayName: string;
  items: PublicItem[];
}) {
  const { spicy: spicyMode } = useSpicy();
  const left = items.filter((i) => !i.checked).length;
  const spicyCount = items.filter((i) => i.spicy).length;

  return (
    <div className="bb-stack">
      <section className="bb-sheet">
        <div className="bb-chip-row">
          <span className="bb-emoji-chip">👁 peek only</span>
          <span className="bb-emoji-chip">🎀 guest</span>
          <span className={`bb-emoji-chip ${spicyMode ? "is-hot" : ""}`}>
            {spicyMode ? "🌶️ unlocked" : "🌶️ locked"}
          </span>
        </div>
        <h1 className="bb-h1">{displayName} 💕</h1>
        <p className="bb-lead">
          {spicyMode
            ? "spicy + retro on. looking only — no edits ✨"
            : "soft peek. flip 🌶️ in the top bar to reveal spicy pics."}
        </p>
        <div className="bb-stats">
          <div>
            <strong>{items.length}</strong>
            <span>bits</span>
          </div>
          <div>
            <strong>{left}</strong>
            <span>open</span>
          </div>
          <div>
            <strong>{spicyCount}</strong>
            <span>spicy</span>
          </div>
        </div>
      </section>

      <section className="bb-sheet">
        {items.length === 0 ? (
          <p className="bb-empty">nothing here yet 🌸</p>
        ) : (
          <ul className="bb-list">
            {items.map((item) => {
              const hide = item.spicy && !spicyMode;
              return (
                <li
                  key={item.id}
                  className={`bb-item ${item.checked ? "is-checked" : ""} ${item.spicy ? "is-spicy-row" : ""}`}
                >
                  <span className="bb-check" aria-hidden>
                    {item.checked ? "✓" : item.spicy ? "🌶️" : "♡"}
                  </span>
                  <div className="bb-item-body">
                    <p className="bb-item-title">
                      {item.spicy ? "🌶️ " : ""}
                      {item.title}
                    </p>
                    {item.note ? <p className="bb-item-note">{item.note}</p> : null}
                  </div>
                  {item.photoUrl ? (
                    <div
                      className={`bb-thumb ${hide ? "is-blurred" : ""} ${item.spicy ? "is-spicy-item" : ""}`}
                    >
                      {item.photoUrl.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photoUrl} alt={hide ? "spicy locked" : item.title} />
                      ) : (
                        <Image
                          src={item.photoUrl}
                          alt={hide ? "spicy locked" : item.title}
                          width={96}
                          height={96}
                          unoptimized
                        />
                      )}
                      {hide ? (
                        <div className="bb-thumb-lock">
                          <span>🌶️</span>
                          <small>spicy</small>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="bb-thumb bb-thumb-empty">{item.spicy ? "🌶️" : "💕"}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
