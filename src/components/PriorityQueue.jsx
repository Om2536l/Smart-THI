import React from "react";
import { AlertTriangle, AlertCircle, Eye, CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import { STATE_META } from "../data/units.js";

const ICON = { emergency: AlertTriangle, critical: AlertCircle, warning: Eye };

export default function PriorityQueue({ units }) {
  const attention = units.filter((u) => ["emergency", "critical", "warning"].includes(u.state));
  const calmCount = units.length - attention.length;

  if (attention.length === 0) {
    return (
      <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <CheckCircle2 size={18} color="var(--healthy)" />
        <span style={{ fontSize: 13.5 }}>All {units.length} units running normally.</span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Needs attention &middot; sorted by priority</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {attention.map((u) => {
          const Icon = ICON[u.state];
          const glowClass = u.state === "emergency" ? "glow-emergency" : u.state === "critical" ? "glow-critical" : "";
          return (
            <a
              key={u.id}
              href={`#/unit/${u.id}`}
              className={`card ${glowClass}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
                textDecoration: "none", color: "inherit", flexWrap: "wrap",
                borderColor: `var(--${u.state})`,
              }}
            >
              <Icon size={20} color={`var(--${u.state})`} style={{ flex: "none" }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{u.id}</span>
                  <span className="mute" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={12} />{u.feeder}
                  </span>
                  <span className={`pill pill-${u.state}`}>{STATE_META[u.state].label}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>{u.aps}</div>
              </div>
              <div className="mono mute" style={{ fontSize: 11.5, textAlign: "right", flex: "none" }}>
                TSI {u.tsi.toFixed(2)} &middot; RUL {u.rul}y
              </div>
              <ChevronRight size={16} className="mute" style={{ flex: "none" }} />
            </a>
          );
        })}
      </div>
      {calmCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px", color: "var(--ink-soft)", fontSize: 12.5 }}>
          <CheckCircle2 size={15} color="var(--healthy)" />
          {calmCount} other unit{calmCount !== 1 ? "s" : ""} running normally
        </div>
      )}
    </div>
  );
}
