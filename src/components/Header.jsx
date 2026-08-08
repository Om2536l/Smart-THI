import React, { useEffect, useState } from "react";
import { Sun, Moon, BookOpen, Radio, Bell } from "lucide-react";
import { LOGO_ICON } from "../assets/logo.js";

export default function Header({
  theme, onToggleTheme, onlineCount, totalCount, onOpenGlossary, onOpenAlerts, unreadCount = 0,
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-IN", { hour12: false });

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20, background: "var(--surface)",
      borderBottom: "1px solid var(--line)", boxShadow: "var(--shadow-card)",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 12 }}>
        <a href="#/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit", minWidth: 0, flex: "none" }}>
          <img src={LOGO_ICON} alt="SMART-THI" style={{ width: 30, height: 42, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, lineHeight: 1.1, whiteSpace: "nowrap" }}>SMART-THI</div>
            <div className="eyebrow" style={{ fontSize: 10, whiteSpace: "nowrap" }} id="tagline">five-index transformer intelligence</div>
          </div>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--healthy)", background: "var(--healthy-bg)", padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap" }} id="online-pill">
            <Radio size={13} />
            <span>{onlineCount}/{totalCount} online</span>
          </div>
          <span className="mono mute" style={{ fontSize: 12, display: "none", minWidth: 74 }} id="clock-desktop">
            {time}
          </span>

          <button className="icon-btn" onClick={onOpenAlerts} aria-label="Open alert center" style={{ position: "relative" }}>
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 999,
                background: "var(--emergency)", color: "#fff", fontSize: 9.5, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
                fontFamily: "var(--font-mono)"
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            className="icon-btn"
            onClick={onOpenGlossary}
            aria-label="Open user manual"
            id="manual-btn"
            style={{ width: "auto", padding: "0 12px", display: "flex", gap: 6 }}
          >
            <BookOpen size={15} />
            <span id="manual-label" style={{ fontSize: 12.5, fontWeight: 500 }}>Manual</span>
          </button>

          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle color theme">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
      <style>{`
        @media (min-width: 560px) { #clock-desktop { display: inline-block !important; } }
        @media (max-width: 460px) { #tagline, #online-pill { display: none; } }
        @media (max-width: 380px) { #manual-label { display: none; } #manual-btn { padding: 0 !important; width: 34px; } }
      `}</style>
    </header>
  );
}
