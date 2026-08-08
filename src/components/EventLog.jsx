import React from "react";
import { Zap, RotateCcw, ShieldAlert, Info, Activity } from "lucide-react";

const ICON = { correction: Zap, reclose: RotateCcw, trip: ShieldAlert, alert: Info, note: Activity };
const COLOR = { correction: "var(--signal)", reclose: "var(--warning)", trip: "var(--emergency)", alert: "var(--critical)", note: "var(--ink-mute)" };

function ago(mins) {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m ago`;
}

export default function EventLog({ events }) {
  if (!events || events.length === 0) {
    return <p className="mute" style={{ fontSize: 13 }}>No autonomous actions recorded &mdash; conditions have stayed nominal.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {events.map((e, i) => {
        const Icon = ICON[e.kind] ?? Info;
        return (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px solid var(--line)" : "none" }}>
            <div style={{ flex: "none", width: 26, height: 26, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={13} color={COLOR[e.kind]} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{e.text}</div>
              <div className="mono mute" style={{ fontSize: 11, marginTop: 2 }}>{ago(e.minutesAgo)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
