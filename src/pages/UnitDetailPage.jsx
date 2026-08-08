import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MapPin, PlayCircle, RefreshCw, Download } from "lucide-react";
import { STATE_META } from "../data/units.js";
import HealthSignature, { indicesToValues } from "../components/HealthSignature.jsx";
import PhaseBars from "../components/PhaseBars.jsx";
import TrendChart from "../components/TrendChart.jsx";
import SignalFlow from "../components/SignalFlow.jsx";
import EventLog from "../components/EventLog.jsx";
import PrintHeader from "../components/PrintHeader.jsx";

const STAGE_FOR_STATE = { emergency: "act", critical: "decide", warning: "decide", caution: "understand", healthy: "sense" };

const TREND_TABS = [
  { key: "rul", label: "RUL", unit: "y", note: "Derived from the IEEE Std C57.91 thermal-ageing model using winding-proximate temperature." },
  { key: "tsi", label: "TSI", unit: "", note: "Instantaneous stability index \u2014 higher is more stable." },
  { key: "dri", label: "DRI", unit: "", note: "Forward-looking dynamic risk \u2014 higher means greater risk if current conditions persist." },
];

// Total simulated overload sequence duration, in seconds.
const SIM_DURATION = 12;

function useOverloadSimulation(unit) {
  const [elapsed, setElapsed] = useState(null);
  const firedRef = useRef(new Set());
  const [simEvents, setSimEvents] = useState([]);

  useEffect(() => {
    if (elapsed === null) return;
    if (elapsed >= SIM_DURATION) {
      const t = setTimeout(() => { setElapsed(null); firedRef.current = new Set(); setSimEvents([]); }, 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed]);

  const fire = (key, text, kind) => {
    if (firedRef.current.has(key)) return;
    firedRef.current.add(key);
    setSimEvents((prev) => [{ kind, text, minutesAgo: 0 }, ...prev]);
  };

  useEffect(() => {
    if (elapsed === 2) fire("trend", "Phase B current trending above threshold \u2014 logged.", "alert");
    if (elapsed === 4) fire("trip", "J severity threshold exceeded \u2014 protective isolation triggered on Phase B.", "trip");
    if (elapsed === 6) fire("lockout", "Phase B isolated \u2014 awaiting reclose window (dead time 5s).", "correction");
    if (elapsed === SIM_DURATION - 1) fire("reclose", "Reclose attempt successful \u2014 Phase B reconnected. System nominal.", "reclose");
  }, [elapsed]);

  const start = () => { firedRef.current = new Set(); setSimEvents([]); setElapsed(0); };

  const overrides = useMemo(() => {
    if (elapsed === null || !unit) return null;
    const [r, y0, b] = unit.phase;
    if (elapsed < 4) return { phase: [r, y0, Math.round(b * (1 + elapsed * 0.35))], state: "warning" };
    if (elapsed < SIM_DURATION - 1) return { phase: [r, y0, 1], state: "critical" };
    return { phase: unit.phase, state: unit.state };
  }, [elapsed, unit]);

  return { running: elapsed !== null, overrides, simEvents, start };
}

export default function UnitDetailPage({ unit }) {
  const sim = useOverloadSimulation(unit);

  if (!unit) {
    return (
      <div className="shell" style={{ padding: "40px 24px" }}>
        <a href="#/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, marginBottom: 16 }}>
          <ArrowLeft size={15} /> Back to fleet
        </a>
        <p>Unit not found.</p>
      </div>
    );
  }

  const [trendTab, setTrendTab] = useState("rul");
  const activeTab = TREND_TABS.find((t) => t.key === trendTab);
  const trendPoints = { rul: unit.rulTrend, tsi: unit.tsiTrend, dri: unit.driTrend }[trendTab];

  const effState = sim.overrides?.state ?? unit.state;
  const effPhase = sim.overrides?.phase ?? unit.phase;
  const effEvents = [...sim.simEvents, ...unit.events];

  return (
    <div className="shell" style={{ padding: "24px 24px 48px" }}>
      <PrintHeader subtitle={`Unit report \u2014 ${unit.id}`} />

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <a href="#/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
          <ArrowLeft size={15} /> Back to fleet
        </a>
        <button className="btn" onClick={() => window.print()}>
          <Download size={14} /> Download report
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{unit.id}</div>
          <div className="muted" style={{ fontSize: 13.5, display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <MapPin size={14} />{unit.feeder}
          </div>
        </div>
        <span className={`pill pill-${effState}`} style={{ fontSize: 12, padding: "5px 14px" }}>{STATE_META[effState].label}</span>
      </div>

      <div className="card" style={{ padding: "16px 18px", marginBottom: 16, borderColor: `var(--${effState})` }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Recommended action</div>
        <p style={{ fontSize: 15 }}>{sim.running ? "Autonomous protection sequence in progress \u2014 see event log below." : unit.aps}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr)", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <h2 style={{ marginBottom: 12 }}>Health signature</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HealthSignature values={indicesToValues(unit)} size={200} color={`var(--${effState})`} />
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <h2 style={{ marginBottom: 14 }}>Three-phase current</h2>
          <PhaseBars phase={effPhase} height={90} />
          <div className="mono" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18, fontSize: 12.5 }}>
            <div><span className="mute">THS &nbsp;</span>{unit.ths}%</div>
            <div><span className="mute">DRI &nbsp;</span>{unit.dri.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <h2>Index trend</h2>
          <div role="group" aria-label="Trend metric" className="card no-print" style={{ display: "flex", padding: 3, gap: 2 }}>
            {TREND_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTrendTab(t.key)}
                style={{
                  border: "none", cursor: "pointer", padding: "5px 12px", borderRadius: 6, fontSize: 12,
                  fontWeight: 500, fontFamily: "var(--font-body)",
                  background: trendTab === t.key ? "var(--signal)" : "transparent",
                  color: trendTab === t.key ? "#fff" : "var(--ink-soft)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart points={trendPoints} unit={activeTab.unit} />
        <p className="mute" style={{ fontSize: 11.5, marginTop: 6 }}>{activeTab.note}</p>
      </div>

      <div className="card" style={{ padding: "18px 20px", marginBottom: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Decision engine &mdash; current stage</h2>
        <SignalFlow activeKey={STAGE_FOR_STATE[effState]} />
      </div>

      <div className="card no-print" style={{ padding: "18px 20px", marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Demo control</h2>
        <p className="mute" style={{ fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 }}>
          Trigger a simulated overload on Phase B to watch detection, protective isolation, and reclose
          happen live \u2014 the sequence a real fault follows through this unit's decision engine.
        </p>
        <button className="btn btn-accent" onClick={sim.start} disabled={sim.running}>
          {sim.running ? <RefreshCw size={14} className="spin" /> : <PlayCircle size={14} />}
          {sim.running ? "Sequence running\u2026" : "Simulate overload"}
        </button>
      </div>

      <div className="card" style={{ padding: "18px 20px" }}>
        <h2 style={{ marginBottom: 10 }}>Event log</h2>
        <EventLog events={effEvents} />
      </div>
    </div>
  );
}
