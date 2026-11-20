"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveSession } from "@/lib/api";
export default function Login() {
  const r = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });
      saveSession(d);
      r.push("/dashboard");
    } catch (x: any) {
      setError(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <div>
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Your fleet is waiting. Let's get to work.</h2>
        </div>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <div className="eyebrow">GEARVAULT ACCOUNT</div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your rentals and bookings.</p>
        <label>Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />
        {error && <p style={{ color: "#ef684f" }}>{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? "Signing in..." : "Sign In →"}
        </button>
        <p>
          New to GEARVAULT?{" "}
          <Link className="text-link" href="/register">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
