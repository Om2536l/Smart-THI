import React from "react";
import { X, Zap, RotateCcw, ShieldAlert, Info, BellOff } from "lucide-react";

const ICON = { correction: Zap, reclose: RotateCcw, trip: ShieldAlert, alert: Info };
const COLOR = { correction: "var(--signal)", reclose: "var(--warning)", trip: "var(--emergency)", alert: "var(--critical)" };

function ago(mins) {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m ago`;
}

export default function AlertCenter({ open, onClose, alerts }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,16,20,0.35)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity .2s ease", zIndex: 40,
        }}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Fleet alert center"
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(420px, 92vw)",
          background: "var(--surface)", borderLeft: "1px solid var(--line)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .25s ease", zIndex: 41,
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 18px", borderBottom: "1px solid var(--line)"
        }}>
          <div>
            <h2 style={{ fontSize: 17 }}>Alert center</h2>
            <p className="mute" style={{ fontSize: 12, marginTop: 3 }}>
              {alerts.length} autonomous action{alerts.length !== 1 ? "s" : ""} across the fleet
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close alert center"><X size={17} /></button>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 14px", flex: 1 }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink-mute)" }}>
              <BellOff size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p style={{ fontSize: 13.5 }}>No autonomous actions recorded across the fleet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {alerts.map((a, i) => {
                const Icon = ICON[a.kind] ?? Info;
                return (
                  <a
                    key={i}
                    href={`#/unit/${a.unitId}`}
                    onClick={onClose}
                    className="card"
                    style={{
                      display: "flex", gap: 12, padding: "12px 14px",
                      textDecoration: "none", color: "inherit"
                    }}
                  >
                    <div style={{
                      flex: "none", width: 30, height: 30, borderRadius: "50%",
                      background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icon size={14} color={COLOR[a.kind]} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                        <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{a.unitId}</span>
                        <span className={`pill pill-${a.state}`} style={{ fontSize: 9.5, padding: "1px 8px" }}>{a.state}</span>
                      </div>
                      <div style={{ fontSize: 12.5 }}>{a.text}</div>
                      <div className="mono mute" style={{ fontSize: 10.5, marginTop: 3 }}>{a.feeder} &middot; {ago(a.minutesAgo)}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
