import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LOGO_BADGE } from "../assets/logo.js";

const TEAM = [
  { name: "Lasure Omkar Rajendra", role: "Project Lead, System Architect & Documentation Head, Co-Researcher" },
  { name: "Ranode Sakshi Babasaheb", role: "Hardware & Assembly Head" },
  { name: "Vispute Nandini Dattatray", role: "Research Head" },
  { name: "Gaikwad Shailesh Shravan", role: "Co-Researcher (Mathematics) & Co-Assembler" },
];

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer style={{ marginTop: 48, position: "relative" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--signal), var(--healthy))" }} />
      <div style={{ borderTop: "1px solid var(--line)" }}>
        <div className="shell" style={{ padding: "28px 24px 24px", display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 340 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <img src={LOGO_BADGE} alt="SMART-THI" style={{ width: 34, height: "auto" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5 }}>SMART-THI</span>
            </div>
            <p className="mute" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              A low-cost, five-index transformer health monitoring and closed-loop correction system.
              Department of Electrical Engineering, Sanjivani College of Engineering, Kopargaon.
            </p>
          </div>

          <div style={{ fontSize: 12.5, minWidth: 200 }}>
            <button
              onClick={() => setAboutOpen((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                cursor: "pointer", padding: 0, marginBottom: aboutOpen ? 10 : 0, fontFamily: "inherit"
              }}
              aria-expanded={aboutOpen}
            >
              <span className="eyebrow">About Team Voltrix</span>
              <ChevronDown size={13} color="var(--ink-mute)" style={{ transform: aboutOpen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
            </button>
            <div style={{
              maxHeight: aboutOpen ? 240 : 0, overflow: "hidden", transition: "max-height .25s ease"
            }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {TEAM.map((m) => (
                  <li key={m.name}>
                    <div style={{ color: "var(--ink)", fontWeight: 500 }}>{m.name}</div>
                    <div className="mute" style={{ fontSize: 11.5, marginTop: 1 }}>{m.role}</div>
                  </li>
                ))}
              </ul>
              <div className="mute" style={{ marginTop: 10 }}>Guided by Dr. Manoj Saha Sir</div>
            </div>
          </div>

          <div style={{ fontSize: 12.5 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Reference</div>
            <div style={{ color: "var(--ink-soft)", lineHeight: 1.9 }}>
              <div>IEEE Std C57.91 &mdash; thermal-ageing model</div>
              <div>AHP weight derivation, CR &lt; 0.1</div>
              <a href="#/methodology">Methodology &amp; weight validation &rarr;</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--line)" }}>
          <div className="shell" style={{
            padding: "12px 24px calc(12px + env(safe-area-inset-bottom, 0px))",
            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 11.5
          }}>
            <span className="mute">Mock data for demonstration &mdash; not live sensor readings</span>
            <span className="mute">&copy; 2026 Team Voltrix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
