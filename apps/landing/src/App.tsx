import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LandingPage } from "@/pages/LandingPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SiteShell } from "@/components/SiteShell";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.hash, location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<SiteShell />}>
          <Route element={<LandingPage />} path="/" />
          <Route element={<PrivacyPage />} path="/privacy" />
        </Route>
      </Routes>
    </>
  );
}
