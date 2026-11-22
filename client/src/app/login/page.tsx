"use client";
import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {ArrowRight,HardHat,ShieldCheck,Zap} from "lucide-react";
import {authClient} from "@/lib/auth-client";
import {ThemeToggle} from "@/components/theme-toggle";

export default function Login(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);const {error}=await authClient.signIn.email({email,password});setBusy(false);if(error){toast.error(error.message||"Unable to sign in");return;}toast.success("Welcome back to GearVault");router.push(new URLSearchParams(window.location.search).get("callbackURL")||"/dashboard");router.refresh();}
 async function google(){const {error}=await authClient.signIn.social({provider:"google",callbackURL:"/dashboard"});if(error)toast.error(error.message);}
 return <main className="auth-page">
  <div className="auth-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">G</span>Gear<span>Vault</span></Link><ThemeToggle/></div>
  <div className="auth-shell">
   <aside className="auth-visual login-visual"><div className="auth-visual-image"/><div className="auth-visual-shade"/>
    <div className="auth-visual-content"><span className="eyebrow">YOUR NEXT PROJECT STARTS HERE</span><h1>Welcome<br/><span>back.</span></h1><p>Pick up where you left off. Discover dependable equipment and make every project count.</p>
     <div className="visual-benefits"><div><ShieldCheck/><b>Secure access</b><small>Your account, protected</small></div><div><Zap/><b>Fast booking</b><small>Get the gear you need</small></div><div><HardHat/><b>Built for work</b><small>One marketplace, more options</small></div></div>
    </div><div className="visual-caption">Find it. Rent it. Get it done.</div>
   </aside>
   <section className="auth-form-wrap"><form onSubmit={submit} className="auth-card login-card">
    <div className="auth-mobile-brand"><span className="brand-mark">G</span></div><p className="eyebrow">GOOD TO SEE YOU AGAIN</p><h2>Sign in to <span className="gradient-text">GearVault</span></h2><p className="auth-subtitle">Access your rentals, listings, and dashboard.</p>
    <div className="auth-fields login-fields"><label>Email address<input className="field" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input className="field" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label></div>
    <button disabled={busy} className="btn-primary auth-submit">{busy?"Signing in…":<>Sign in <ArrowRight size={17}/></>}</button>
    <div className="auth-divider"><span>or continue with</span></div><button type="button" onClick={google} className="btn-ghost google-button"><span className="google-g">G</span>Continue with Google</button>
    <p className="auth-switch">New to GearVault? <Link href="/register">Create an account</Link></p>
   </form></section>
  </div>
 </main>;
}
