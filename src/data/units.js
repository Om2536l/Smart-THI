export const STATES = ["healthy", "caution", "warning", "critical", "emergency"];

export const STATE_META = {
  healthy: { label: "Healthy", rank: 0, action: "No action needed" },
  caution: { label: "Caution", rank: 1, action: "No action — within normal variance" },
  warning: { label: "Warning", rank: 2, action: "Keep watching" },
  critical: { label: "Critical", rank: 3, action: "Check soon" },
  emergency: { label: "Emergency", rank: 4, action: "Act now" },
};

const RAW = [
  { id: "UNIT-01", feeder: "Kopargaon Feeder 1", state: "healthy", tsi: 0.90, ths: 88, dri: 0.12, rul: 27.4, phase: [41, 42, 40] },
  { id: "UNIT-02", feeder: "Kopargaon Feeder 2", state: "caution", tsi: 0.70, ths: 74, dri: 0.29, rul: 21.2, phase: [44, 46, 43] },
  { id: "UNIT-03", feeder: "Sanjivani Campus", state: "critical", tsi: 0.32, ths: 46, dri: 0.68, rul: 8.6, phase: [39, 52, 33] },
  { id: "UNIT-04", feeder: "Rahata Feeder 1", state: "healthy", tsi: 0.87, ths: 91, dri: 0.14, rul: 29.1, phase: [40, 41, 39] },
  { id: "UNIT-05", feeder: "Rahata Feeder 3", state: "warning", tsi: 0.52, ths: 61, dri: 0.48, rul: 14.3, phase: [45, 49, 41] },
  { id: "UNIT-06", feeder: "Kopargaon Feeder 4", state: "healthy", tsi: 0.84, ths: 85, dri: 0.17, rul: 24.8, phase: [43, 44, 42] },
  { id: "UNIT-07", feeder: "Shrirampur Feeder 1", state: "emergency", tsi: 0.15, ths: 31, dri: 0.85, rul: 3.2, phase: [42, 61, 34] },
  { id: "UNIT-08", feeder: "Shrirampur Feeder 2", state: "healthy", tsi: 0.93, ths: 94, dri: 0.09, rul: 30.0, phase: [39, 40, 38] },
];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

function buildRulTrend(unit) {
  const rand = mulberry32(seedFromId(unit.id));
  const points = 14;
  const severity = 1 - unit.tsi;
  const out = [];
  let val = unit.rul + severity * 6;
  for (let i = 0; i < points; i++) {
    const decay = (severity * 6 * i) / (points - 1);
    const noise = (rand() - 0.5) * (0.4 + severity * 0.6);
    out.push(Math.max(0.2, +(unit.rul + severity * 6 - decay + noise).toFixed(2)));
  }
  out[out.length - 1] = unit.rul;
  return out;
}

// Generic bounded trend builder for TSI/DRI (both 0..1). Walks backward from
// the unit's current value with seeded drift + noise so the final point
// always lands exactly on the unit's real current reading.
function buildBoundedTrend(unit, currentValue, seedSalt, driftDirection) {
  const rand = mulberry32(seedFromId(unit.id) ^ seedSalt);
  const points = 14;
  const out = [];
  const drift = driftDirection * (0.015 + (1 - unit.tsi) * 0.02);
  let val = currentValue - drift * (points - 1);
  for (let i = 0; i < points; i++) {
    const noise = (rand() - 0.5) * 0.05;
    val += drift + noise;
    out.push(+Math.max(0, Math.min(1, val)).toFixed(3));
  }
  out[out.length - 1] = currentValue;
  return out;
}

function buildTsiTrend(unit) {
  return buildBoundedTrend(unit, unit.tsi, 0x1a2b3c, unit.tsi < 0.6 ? 1 : -0.3);
}

function buildDriTrend(unit) {
  return buildBoundedTrend(unit, unit.dri, 0x4d5e6f, unit.dri > 0.4 ? -1 : 0.3);
}

const EVENT_LIBRARY = {
  emergency: [
    { kind: "trip", text: "Fault confirmed (DRI \u2265 0.8) \u2014 relay tripped" },
    { kind: "reclose", text: "Reclose attempt 1/3 \u2014 fault persisted" },
    { kind: "reclose", text: "Reclose attempt 2/3 \u2014 fault persisted" },
    { kind: "correction", text: "Phase correction executed \u2014 J: 512 \u2192 89" },
    { kind: "alert", text: "Escalated to duty engineer" },
  ],
  critical: [
    { kind: "correction", text: "Phase correction executed \u2014 J: 340 \u2192 41" },
    { kind: "alert", text: "Threshold crossed \u2014 THS below 50%" },
  ],
  warning: [
    { kind: "correction", text: "Phase correction executed \u2014 J: 210 \u2192 38" },
    { kind: "note", text: "Load variation above baseline for 40 min" },
  ],
  caution: [
    { kind: "note", text: "Minor imbalance observed, within tolerance" },
  ],
  healthy: [
    { kind: "note", text: "Routine check \u2014 all indices nominal" },
  ],
};

function buildEvents(unit) {
  const rand = mulberry32(seedFromId(unit.id) ^ 0x9e3779b9);
  const templates = EVENT_LIBRARY[unit.state];
  let minutesAgo = 6 + Math.floor(rand() * 20);
  return templates.map((t) => {
    const e = { ...t, minutesAgo };
    minutesAgo += 30 + Math.floor(rand() * 90);
    return e;
  });
}

export function fetchUnits() {
  return RAW.map((u) => ({
    ...u,
    aps: STATE_META[u.state].action,
    rulTrend: buildRulTrend(u),
    tsiTrend: buildTsiTrend(u),
    driTrend: buildDriTrend(u),
    events: buildEvents(u),
  })).sort((a, b) => STATE_META[b.state].rank - STATE_META[a.state].rank);
}

// Fleet-wide alert feed: every unit's autonomous-action events, flattened
// and sorted most-recent-first, each tagged with its source unit.
const ALERT_KINDS = new Set(["trip", "reclose", "correction", "alert"]);

export function fetchAlerts(units) {
  const flat = [];
  for (const u of units) {
    for (const e of u.events) {
      if (ALERT_KINDS.has(e.kind)) {
        flat.push({ ...e, unitId: u.id, feeder: u.feeder, state: u.state });
      }
    }
  }
  return flat.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export const FLEET_LOCATION = "Kopargaon & neighbouring feeders, Maharashtra";

export const WEIGHTS = [
  { key: "Vs", label: "Voltage stability", ahp: 0.22, empirical: 0.19 },
  { key: "Cf", label: "Current fluctuation", ahp: 0.18, empirical: 0.21 },
  { key: "Tv", label: "Temperature variation", ahp: 0.24, empirical: 0.27 },
  { key: "PI", label: "Phase imbalance", ahp: 0.26, empirical: 0.23 },
  { key: "Lv", label: "Load variation", ahp: 0.10, empirical: 0.10 },
];

export const CONSISTENCY_RATIO = 0.043;
