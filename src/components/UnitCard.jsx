import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { STATE_META } from "../data/units.js";
import HealthSignature, { indicesToValues } from "./HealthSignature.jsx";
import PhaseBars from "./PhaseBars.jsx";

export default function UnitCard({ unit, view }) {
  return (
    <a
      href={`#/unit/${unit.id}`}
      className="card"
      style={{ display: "block", padding: "16px 18px", textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{unit.id}</div>
          <div className="mute" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <MapPin size={12} />{unit.feeder}
          </div>
        </div>
        <span className={`pill pill-${unit.state}`}>{STATE_META[unit.state].label}</span>
      </div>

      {view === "operator" ? (
        <p style={{ fontSize: 13, color: "var(--ink-soft)", minHeight: 36 }}>{unit.aps}</p>
      ) : (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <HealthSignature values={indicesToValues(unit)} size={92} showLabels={false} color={`var(--${unit.state})`} />
          <PhaseBars phase={unit.phase} height={40} compact />
        </div>
      )}

      <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-mute)", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
        <span>TSI {unit.tsi.toFixed(2)}</span>
        <span>RUL {unit.rul}y</span>
        <span style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--signal)" }}>
          Details <ChevronRight size={13} />
        </span>
      </div>
    </a>
  );
}
