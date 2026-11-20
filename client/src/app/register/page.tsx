"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  UserRoundPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { api, saveSession } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");

  async function submit(e: any) {
    e.preventDefault();
    setError("");
    const f = e.currentTarget;
    const password = f.password.value;
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      password.length < 6
    ) {
      setError(
        "Password must include an uppercase letter, a lowercase letter and at least 6 characters.",
      );
      return;
    }
    setBusy(true);
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: f.name.value.trim(),
          email: f.email.value.trim(),
          photo: f.photo.value.trim(),
          password,
          role,
        }),
      });
      saveSession(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Unable to create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="register-page">
      <section className="register-left">
        <motion.form
          className="register-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="register-heading">
            <h1>Create your account</h1>
            <p>
              Join as a customer to rent, or as an owner to list your fleet.
            </p>
          </div>

          <div className="register-field">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              name="name"
              placeholder="Enter Your Name"
              autoComplete="name"
              required
              minLength={2}
            />
          </div>
          <div className="register-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="register-field">
            <label htmlFor="register-photo">
              Photo URL (direct image link)
            </label>
            <div className="register-input-icon">
              <Camera size={16} />
              <input
                id="register-photo"
                name="photo"
                type="url"
                placeholder="https://i.ibb.co/your-photo.jpg"
              />
            </div>
          </div>
          <div className="register-field">
            <label htmlFor="register-role">I want to join as</label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Customer — I rent equipment</option>
              <option value="owner">Equipment Owner — I list equipment</option>
            </select>
          </div>
          <div className="register-field register-password-field">
            <label htmlFor="register-password">Password</label>
            <div className="register-password-wrap">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="password-rules">
              <span>
                <Check size={11} /> Uppercase
              </span>
              <span>
                <Check size={11} /> Lowercase
              </span>
              <span>
                <Check size={11} /> 6+ characters
              </span>
            </div>
          </div>

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}
          <button className="register-submit" type="submit" disabled={busy}>
            <UserRoundPlus size={16} />{" "}
            {busy ? "Creating account..." : "Create Account"}
          </button>
          <div className="register-privacy">
            <ShieldCheck size={14} /> We never share your details. No email
            verification needed.
          </div>
          <p className="register-signin">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </motion.form>
      </section>

      <aside className="register-visual">
        <div className="register-visual-content">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            <h2>
              Join a marketplace built for <span>real work.</span>
            </h2>
            <div className="register-benefit">
              <i>
                <Check size={14} />
              </i>
              <div>
                <b>Instant listings</b>
                <p>
                  Owners publish gear in minutes and get admin approval within a
                  day.
                </p>
              </div>
            </div>
            <div className="register-benefit">
              <i>
                <Check size={14} />
              </i>
              <div>
                <b>Protected payments</b>
                <p>
                  Every booking is paid through secure, encrypted Stripe
                  checkout.
                </p>
              </div>
            </div>
            <div className="register-benefit">
              <i>
                <Check size={14} />
              </i>
              <div>
                <b>Damage guarantees</b>
                <p>
                  Verified owners and clear terms protect both sides of the
                  deal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </aside>
    </div>
  );
}
