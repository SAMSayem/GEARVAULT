"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);

  const links = [
    ["Home", "/"],
    ["Equipment", "/equipment"],
    ["How it works", "/#how-it-works"],
  ];

  const logout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <BrandLogo />

        <nav className="site-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={path === href ? "current" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="site-actions">
          <ThemeToggle />

          {session?.user ? (
            <>
              <Link className="btn-ghost text-sm" href="/dashboard">
                Dashboard
              </Link>
              <button className="btn-primary text-sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          <div className="container mobile-menu-inner">
            {links.map(([label, href]) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}

            <div className="mobile-menu-tools">
              <ThemeToggle />

              {session?.user ? (
                <>
                  <Link href="/dashboard" className="btn-ghost">
                    Dashboard
                  </Link>
                  <button className="btn-primary" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
