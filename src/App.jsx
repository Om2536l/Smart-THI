import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import GlossaryPanel from "./components/GlossaryPanel.jsx";
import AlertCenter from "./components/AlertCenter.jsx";
import FleetPage from "./pages/FleetPage.jsx";
import UnitDetailPage from "./pages/UnitDetailPage.jsx";
import MethodologyPage from "./pages/MethodologyPage.jsx";
import { fetchUnits, fetchAlerts } from "./data/units.js";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

// Default is always light unless the person has explicitly chosen otherwise —
// deliberately does NOT fall back to system dark-mode preference.
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("smart-thi-theme") || "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("smart-thi-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0B1417" : "#F3F6F5");
  }, [theme]);
  return [theme, setTheme];
}

export default function App() {
  const hash = useHashRoute();
  const [theme, setTheme] = useTheme();
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [seenAlertCount, setSeenAlertCount] = useState(0);
  const units = useMemo(() => fetchUnits(), []);
  const alerts = useMemo(() => fetchAlerts(units), [units]);

  useEffect(() => { window.scrollTo(0, 0); }, [hash]);

  let page;
  const unitMatch = hash.match(/^#\/unit\/([\w-]+)/);
  if (unitMatch) {
    const unit = units.find((u) => u.id === unitMatch[1]);
    page = <UnitDetailPage unit={unit} units={units} />;
  } else if (hash.startsWith("#/methodology")) {
    page = <MethodologyPage />;
  } else {
    page = <FleetPage units={units} />;
  }

  const onlineCount = units.length;
  const unreadCount = Math.max(0, alerts.length - seenAlertCount);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onlineCount={onlineCount}
        totalCount={units.length}
        onOpenGlossary={() => setGlossaryOpen(true)}
        onOpenAlerts={() => { setAlertsOpen(true); setSeenAlertCount(alerts.length); }}
        unreadCount={unreadCount}
      />
      <main style={{ flex: 1 }}>{page}</main>
      <Footer />
      <GlossaryPanel open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <AlertCenter open={alertsOpen} onClose={() => setAlertsOpen(false)} alerts={alerts} />
    </div>
  );
}
