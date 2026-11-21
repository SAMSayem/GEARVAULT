"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Camera, Check, HardHat, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

type Role = "customer" | "owner";

export default function Register() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [photoURL,setPhotoURL] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState<Role>("customer");
  const [busy,setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      toast.error("Password must contain uppercase, lowercase, and at least 6 characters"); return;
    }
    setBusy(true);
    try {
      const {error} = await authClient.signUp.email({name,email,password});
      if (error) { toast.error(error.message || "Could not create account"); return; }
      const tokenResponse = await fetch("/api/session-token",{cache:"no-store"});
      if (!tokenResponse.ok) throw new Error("Account created, but the session could not be started.");
      const {token} = await tokenResponse.json();
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const roleResponse = await fetch(`${api}/users/me/role`,{
        method:"PATCH",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
        body:JSON.stringify({role})
      });
      if (!roleResponse.ok) throw new Error("Account created, but role setup failed. Please sign in and try again.");
      if (photoURL.trim()) {
        await fetch(`${api}/users/me`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({photoURL:photoURL.trim()})});
      }
      toast.success(`Welcome to GearVault! Your ${role} account is ready.`);
      router.push("/dashboard"); router.refresh();
    } catch(err) {
      toast.error(err instanceof Error ? err.message : "Unable to finish registration.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">G</span>Gear<span>Vault</span></Link><ThemeToggle/></div>
    <div className="auth-shell auth-shell-register">
      <aside className="auth-visual register-visual">
        <div className="auth-visual-image"/><div className="auth-visual-shade"/>
        <div className="auth-visual-content">
          <span className="eyebrow">RENT · USE · GROW</span>
          <h1>Bring your next<br/><span>big idea</span> to life.</h1>
          <p>Find the right tools for the job, or turn your equipment into a growing rental business.</p>
          <div className="visual-benefits">
            <div><Users/><b>Flexible rentals</b><small>For projects of every size</small></div>
            <div><ShieldCheck/><b>Trusted community</b><small>Built around safer rentals</small></div>
            <div><HardHat/><b>Quality equipment</b><small>Tools ready to get to work</small></div>
          </div>
        </div><div className="visual-caption">The right equipment changes everything.</div>
      </aside>
      <section className="auth-form-wrap"><form onSubmit={submit} className="auth-card">
        <div className="auth-mobile-brand"><span className="brand-mark">G</span></div>
        <p className="eyebrow">CREATE YOUR ACCOUNT</p><h2>Join <span className="gradient-text">GearVault</span></h2>
        <p className="auth-subtitle">Choose how you want to use the marketplace.</p>
        <div className="role-picker" role="group" aria-label="Choose account type">
          <button type="button" onClick={()=>setRole("customer")} className={`role-option ${role==="customer"?"selected":""}`} aria-pressed={role==="customer"}>
            <span className="role-icon"><ShoppingBag size={20}/></span><span><b>Customer</b><small>I want to rent equipment</small></span>{role==="customer"&&<Check className="role-check" size={17}/>}
          </button>
          <button type="button" onClick={()=>setRole("owner")} className={`role-option ${role==="owner"?"selected":""}`} aria-pressed={role==="owner"}>
            <span className="role-icon"><HardHat size={20}/></span><span><b>Equipment Owner</b><small>I want to list my fleet</small></span>{role==="owner"&&<Check className="role-check" size={17}/>}
          </button>
        </div>
        <div className="auth-fields">
          <label>Full name<input className="field" required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>
          <label>Email address<input className="field" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
          <label>Photo URL <span className="optional">(optional)</span><span className="input-with-icon"><Camera size={16}/><input className="field" type="url" value={photoURL} onChange={e=>setPhotoURL(e.target.value)} placeholder="https://your-photo.jpg"/></span></label>
          <label>Password<input className="field" type="password" minLength={6} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a strong password"/></label>
        </div>
        <div className="password-rules"><span className={/[A-Z]/.test(password)?"valid":""}><Check size={12}/> Uppercase</span><span className={/[a-z]/.test(password)?"valid":""}><Check size={12}/> Lowercase</span><span className={password.length>=6?"valid":""}><Check size={12}/> 6+ characters</span></div>
        <button disabled={busy} className="btn-primary auth-submit">{busy?"Creating account…":<>Create {role==="owner"?"owner":"customer"} account <ArrowRight size={17}/></>}</button>
        <p className="privacy-note"><ShieldCheck size={15}/> Your details stay protected. No email verification needed.</p>
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </form></section>
    </div>
  </main>;
}
