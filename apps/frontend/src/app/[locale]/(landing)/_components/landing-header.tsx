"use client";

import { MenuIcon, PenLineIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthCtaButton } from "@/components/auth/auth-cta-button";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const anchorLinks = ["faq"] as const;

export function LandingHeader() {
  const t = useTranslations("landing.header");
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
      {anchorLinks.map((key) => (
        <li key={key}>
          <a
            href={`#${key}`}
            aria-label={t(key)}
            title={t(key)}
            className="block rounded-md px-2 py-1.5 text-sm font-normal tracking-wide transition-colors hover:text-foreground md:px-0"
            onClick={() => setMenuOpen(false)}
          >
            {t(key)}
          </a>
        </li>
      ))}
    </ul>
  );

  const startButton = (
    <AuthCtaButton size="lg">
      <PenLineIcon data-icon="inline-start" />
      {t("start")}
    </AuthCtaButton>
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

        <div className="hidden flex-1 justify-center md:flex">{nav}</div>

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
          {nav}
          <div className="pt-4">{startButton}</div>
        </div>
      )}
    </header>
  );
}
