"use client";

import { MenuIcon, PenLineIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useWorkspaceEntry } from "@/components/buss/auth-dialog";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const t = useTranslations("landing.header");
  const enterWorkspace = useWorkspaceEntry();
  const [menuOpen, setMenuOpen] = useState(false);

  const startButton = (
    <Button size="lg" onClick={() => void enterWorkspace()}>
      <PenLineIcon data-icon="inline-start" />
      {t("start")}
    </Button>
  );

  return (
    <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="relative z-50 flex items-center justify-between">
        <div className="flex flex-1 items-center gap-12">
          <Link href="/" aria-label="Narraverse" className="flex items-center gap-2 font-bold">
            <Image
              src="/logo.png"
              alt="Narraverse Logo"
              className="size-8"
              width={32}
              height={32}
            />
            <span className="hidden md:block">Narraverse</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-6">
          <div className="hidden md:block">{startButton}</div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </Button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="absolute inset-x-4 top-full z-50 rounded-xl border bg-card p-5 shadow-lg md:hidden">
          {startButton}
        </div>
      )}
    </header>
  );
}
