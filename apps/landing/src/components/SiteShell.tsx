import { Menu, Shield, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { useSiteManifest } from "@/hooks/useSiteManifest";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#screens", label: "Telas" },
  { href: "/privacy", label: "Privacy" }
];

export function SiteShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const manifest = useSiteManifest();

  return (
    <div className="page-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-paper/85 backdrop-blur-xl">
        <div className="section-frame flex h-20 items-center justify-between gap-6">
          <Link className="flex items-center gap-3" to="/">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-lg font-bold text-white shadow-lg shadow-moss/20">
              DH
            </div>
            <div>
              <div className="font-display text-2xl font-semibold tracking-tight">DevHora</div>
              <div className="text-xs uppercase tracking-[0.2em] text-dusk">controle local de jornada</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-ink/72 transition-colors hover:bg-white/70 hover:text-ink",
                  location.pathname === "/privacy" && item.href === "/privacy" ? "bg-white text-ink" : ""
                )}
                key={item.href}
                to={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            {manifest.hasApk ? (
              <a className={buttonVariants({ size: "sm", variant: "warm" })} href="/generated/downloads/devhora-latest.apk">
                <Smartphone className="h-4 w-4" />
                Android APK
              </a>
            ) : (
              <span
                className={cn(
                  buttonVariants({ size: "sm", variant: "secondary" }),
                  "cursor-not-allowed opacity-70"
                )}
              >
                <Smartphone className="h-4 w-4" />
                APK em preparo
              </span>
            )}
          </div>

          <button
            aria-label="Abrir menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-moss/15 bg-white/70 text-ink md:hidden"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/60 bg-paper/95 md:hidden">
            <div className="section-frame flex flex-col gap-2 py-4">
              {navItems.map((item) => (
                <Link
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-ink/80 hover:bg-white/75"
                  key={item.href}
                  onClick={() => setOpen(false)}
                  to={item.href}
                >
                  {item.label}
                </Link>
              ))}
              {manifest.hasApk ? (
                <a
                  className="flex items-center gap-2 rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white"
                  href="/generated/downloads/devhora-latest.apk"
                >
                  <Smartphone className="h-4 w-4" />
                  Baixar APK
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink/70">
                  <Smartphone className="h-4 w-4" />
                  APK em preparo
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <Outlet />

      <footer className="border-t border-white/50 bg-[#eef2e5]/90">
        <div className="section-frame flex flex-col gap-4 py-10 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-ink">DevHora</div>
            <p className="m-0 max-w-xl">
              App Android para registrar jornada, acompanhar saldo e manter backup local sem depender de conta online.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="inline-flex items-center gap-2 hover:text-ink" to="/privacy">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Link>
            <span>devhora.lucas-tavares.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
