"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import Image from "next/image";
import { Sun, Moon, Menu, X, LogOut, UserPlus } from "lucide-react";
import { LogIn } from "lucide-react";
// Shared logo: identical in Header and Footer
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="GEARVAULT home">
      <span className="brand-mark">
        <Image
          src="/gearvault-mark.svg"
          alt="GEARVAULT"
          width={36}
          height={36}
          priority
        />
      </span>

      <span className="brand-word">
        GEAR<span className="orange">VAULT</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("gv_user") || "null"));
    } catch {
      setUser(null);
    }
  }, []);

  function logout() {
    localStorage.removeItem("gv_token");
    localStorage.removeItem("gv_user");
    location.href = "/";
  }

  const closeMenu = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Brand />

        <nav
          className={`nav-links${open ? " show" : ""}`}
          aria-label="Main navigation"
        >
          <div className="nav-primary-links">
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>

            <Link href="/equipment" onClick={closeMenu}>
              All Equipment
            </Link>
          </div>

          <div className="nav-account-links">
            <button
              type="button"
              className="nav-theme"
              onClick={() => {
                toggle();
                closeMenu();
              }}
              aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
              title={`Switch to ${dark ? "light" : "dark"} mode`}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
              <span className="theme-label">
                {dark ? "Light mode" : "Dark mode"}
              </span>
            </button>

            {user ? (
              <>
                <Link href="/dashboard" onClick={closeMenu}>
                  Dashboard
                </Link>

                <button
                  type="button"
                  className="nav-account-button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-login" href="/login" onClick={closeMenu}>
                  <LogIn size={16} strokeWidth={2} />
                  <span>Login</span>
                </Link>

                <Link className="nav-cta" href="/register" onClick={closeMenu}>
                  <UserPlus size={16} strokeWidth={2.4} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn mobile-theme"
            onClick={toggle}
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className="icon-btn mobile-menu"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        {/* Exactly the same logo component as Header */}
        <Brand />

        <p>
          Serious equipment. Smarter rentals.
          <br />
          Powering the people who get the job done.
        </p>
      </div>

      <div>
        <b>Explore</b>
        <Link href="/equipment">All Equipment</Link>
        <a href="/#how">How it works</a>
        <a href="/#reviews">Reviews</a>
      </div>

      <div>
        <b>Account</b>
        <Link href="/login">Sign in</Link>
        <Link href="/register">Create account</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>

      <div>
        <b>Get in touch</b>
        <span>hello@gearvault.example</span>
        <span>Dhaka, Bangladesh</span>
      </div>

      <small>
        © {new Date().getFullYear()} GEARVAULT. Built for people who build.
      </small>
    </footer>
  );
}
