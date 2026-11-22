"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, CalendarDays, CircleDollarSign, ClipboardList, Heart,
  Package, Plus, ShieldCheck, Sparkles, TrendingUp, Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { api, getApiToken } from "@/lib/api";
import { DashboardEmpty, DashboardShell } from "@/components/dashboard-shell";
import { toast } from "sonner";

type Role = "customer" | "owner" | "admin";

const money = (value: unknown) => `৳${Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
const dateLabel = (value?: string | Date) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
    if (!session) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const token = await getApiToken();
        const me = await api("/users/me", {}, token);
        if (!alive) return;
        setProfile(me.user);
        const role: Role = me.user?.role || "customer";
        if (role === "owner" || role === "admin") {
          const result = await api(role === "admin" ? "/analytics/admin" : "/analytics/owner", {}, token);
          if (alive) setAnalytics(result);
        } else {
          const [myBookings, myFavorites] = await Promise.all([
            api("/bookings/mine", {}, token).catch(() => ({ bookings: [] })),
            api("/favorites", {}, token).catch(() => ({ favorites: [] })),
          ]);
          if (alive) {
            setBookings(myBookings.bookings || []);
            setFavorites(myFavorites.favorites || []);
          }
        }
      } catch (error: any) {
        if (alive) toast.error(error.message || "Unable to load your dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [session, isPending, router]);

  const role: Role = profile?.role || "customer";
  const displayName = profile?.name || session?.user?.name || "there";
  const stats = analytics?.stats || {};
  const openBookings = useMemo(() => bookings.filter((b) => !["completed", "cancelled"].includes(b.bookingStatus)), [bookings]);

  if (isPending || !session || loading) return <div className="container dashboard-loading"><span className="loading-orbit"/><p>Preparing your GearVault workspace…</p></div>;

  return (
    <DashboardShell
      role={role}
      name={profile?.name || session.user.name}
      image={profile?.photoURL || profile?.image || session.user.image || ""}
      title={<>Welcome back, <span className="gradient-text">{displayName.split(" ")[0]}</span></>}
      subtitle={role === "admin" ? "A clear view of marketplace health, users and rental activity." : role === "owner" ? "Track your equipment business, manage listings and stay on top of rental requests." : "Your rentals, saved equipment and account details are all in one place."}
      eyebrow={role === "admin" ? "PLATFORM CONTROL CENTER" : role === "owner" ? "OWNER WORKSPACE" : "RENTER WORKSPACE"}
      action={role === "owner" ? <Link className="btn-primary" href="/dashboard/owner/add"><Plus size={17}/> Add equipment</Link> : role === "customer" ? <Link className="btn-primary" href="/equipment"><Package size={17}/> Browse equipment</Link> : <Link className="btn-ghost" href="/dashboard/admin/users">Manage users <ArrowRight size={15}/></Link>}
    >
      <div className="dashboard-welcome-banner">
        <div><span className="welcome-kicker"><Sparkles size={14}/> YOUR GEARVAULT AT A GLANCE</span><h2>{role === "admin" ? "Keep the marketplace moving." : role === "owner" ? "Make every asset work harder." : "Ready for your next project?"}</h2><p>{role === "admin" ? "Review activity, keep listings organized and support a reliable rental experience." : role === "owner" ? "A well-managed listing helps renters discover the right equipment and book with confidence." : "Find the right tools, compare options and book equipment when you need it."}</p></div>
        <div className="welcome-banner-art"><div className="welcome-art-ring ring-one"/><div className="welcome-art-ring ring-two"/><Package size={48}/><span>GV</span></div>
      </div>

      {role === "customer" ? (
        <>
          <div className="dashboard-stat-grid dashboard-stat-grid-three">
            <StatCard icon={ClipboardList} label="Total rentals" value={bookings.length} note="Your booking history"/>
            <StatCard icon={CalendarDays} label="In progress" value={openBookings.length} note="Current and upcoming"/>
            <StatCard icon={Heart} label="Saved equipment" value={favorites.length} note="Your shortlist"/>
          </div>
          <div className="dashboard-content-grid customer-overview-grid">
            <section className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Recent rentals</h2></div><Link className="panel-link" href="/dashboard/customer">View all <ArrowRight size={14}/></Link></div>
              {bookings.length ? <div className="recent-booking-list">{bookings.slice(0, 4).map((booking) => <div className="recent-booking-row" key={booking._id}><div className="recent-booking-thumb">{booking.equipment?.image || booking.equipmentImage ? <img src={booking.equipment?.image || booking.equipmentImage} alt=""/> : <Package size={19}/>}</div><div className="recent-booking-details"><b>{booking.equipment?.title || booking.equipmentTitle || "Equipment rental"}</b><small>{dateLabel(booking.startDate)} – {dateLabel(booking.endDate)}</small></div><div className="recent-booking-meta"><b>{money(booking.totalAmount)}</b><Status value={booking.bookingStatus}/></div></div>)}</div> : <DashboardEmpty title="No rentals yet" description="Your upcoming and completed equipment rentals will appear here." href="/equipment"/>}
            </section>
            <section className="dashboard-panel dashboard-profile-panel">
              <div className="panel-heading"><div><span className="eyebrow">ACCOUNT SNAPSHOT</span><h2>Your account</h2></div><ShieldCheck className="panel-heading-icon" size={20}/></div>
              <div className="account-summary"><div className="account-avatar">{profile?.photoURL || profile?.image ? <img src={profile.photoURL || profile.image} alt=""/> : (profile?.name || "G").slice(0, 1).toUpperCase()}</div><div><b>{profile?.name || session.user.name}</b><span>{profile?.email || session.user.email}</span></div></div>
              <div className="account-summary-list"><div><span>Account type</span><b>Customer</b></div><div><span>Member since</span><b>{dateLabel(profile?.createdAt)}</b></div><div><span>Contact number</span><b>{profile?.phone || "Not added"}</b></div></div>
              <Link className="btn-ghost account-edit-button" href="/dashboard/profile">View and edit profile <ArrowRight size={15}/></Link>
            </section>
          </div>
          <div className="dashboard-shortcut-grid"><Shortcut href="/equipment" icon={Package} title="Explore equipment" copy="Browse approved listings across categories."/><Shortcut href="/dashboard/customer/favorites" icon={Heart} title="Saved favorites" copy="Return to equipment you have shortlisted."/><Shortcut href="/dashboard/profile" icon={ShieldCheck} title="Account settings" copy="Keep your contact information up to date."/></div>
        </>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            {role === "admin" ? <>
              <StatCard icon={Users} label="Total users" value={stats.total_users ?? 0} note="Registered accounts"/>
              <StatCard icon={Package} label="Total equipment" value={stats.total_equipment ?? 0} note={`${stats.approved_equipment ?? 0} approved listings`}/>
              <StatCard icon={ClipboardList} label="Total bookings" value={stats.total_bookings ?? 0} note={`${stats.completed_rentals ?? 0} completed rentals`}/>
              <StatCard icon={ShieldCheck} label="Pending approvals" value={stats.pending_approvals ?? 0} note="Listings awaiting review" accent="blue"/>
              <StatCard icon={CircleDollarSign} label="Platform revenue" value={money(stats.total_revenue)} note="Successful payments" accent="green"/>
            </> : <>
              <StatCard icon={Package} label="Listed equipment" value={stats.total_listed_equipment ?? 0} note="Your equipment inventory"/>
              <StatCard icon={ClipboardList} label="Total bookings" value={stats.total_bookings ?? 0} note="Bookings for your listings"/>
              <StatCard icon={CalendarDays} label="Completed rentals" value={stats.completed_rentals ?? 0} note="Successfully completed" accent="green"/>
              <StatCard icon={CircleDollarSign} label="Total earnings" value={money(stats.total_earnings)} note="Successful rental payments" accent="blue"/>
            </>}
          </div>
          <div className="dashboard-content-grid">
            <section className="dashboard-panel dashboard-performance-panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>{role === "admin" ? "Marketplace overview" : "Your rental performance"}</h2></div><TrendingUp className="panel-heading-icon" size={20}/></div><MiniPerformance rows={role === "admin" ? analytics?.monthly_bookings : analytics?.monthly_earnings} mode={role}/></section>
            <section className="dashboard-panel dashboard-next-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h2>{role === "admin" ? "Manage platform" : "Grow your listings"}</h2></div></div>
              {role === "admin" ? <div className="quick-action-list"><QuickAction href="/dashboard/admin/users" icon={Users} title="Manage users" copy="Review accounts and permissions"/><QuickAction href="/dashboard/admin/equipment" icon={Package} title="Review equipment" copy="Approve or update submitted listings"/><QuickAction href="/dashboard/admin/rentals" icon={ClipboardList} title="Monitor rentals" copy="View all marketplace bookings"/></div> : <div className="quick-action-list"><QuickAction href="/dashboard/owner/add" icon={Plus} title="Add a new listing" copy="Make another asset available to rent"/><QuickAction href="/dashboard/owner/equipment" icon={Package} title="Manage equipment" copy="Update your prices and availability"/><QuickAction href="/dashboard/owner/rentals" icon={ClipboardList} title="Review rental requests" copy="Manage requests from customers"/></div>}
            </section>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, note, accent = "orange" }: any) {
  return <article className={`dashboard-stat-card accent-${accent}`}><div className="stat-card-top"><span className="stat-icon"><Icon size={19}/></span><span className="stat-indicator"><TrendingUp size={13}/></span></div><p>{label}</p><strong>{value}</strong><small>{note}</small></article>;
}
function Status({ value }: { value?: string }) {
  const status = (value || "pending").toLowerCase();
  return <span className={`status-badge status-${status.replaceAll("_", "-")}`}>{status.replaceAll("_", " ")}</span>;
}
function Shortcut({ href, icon: Icon, title, copy }: any) { return <Link href={href} className="dashboard-shortcut"><span><Icon size={18}/></span><div><b>{title}</b><small>{copy}</small></div><ArrowRight size={16}/></Link>; }
function QuickAction({ href, icon: Icon, title, copy }: any) { return <Link href={href} className="quick-action"><span className="quick-action-icon"><Icon size={17}/></span><span><b>{title}</b><small>{copy}</small></span><ArrowRight size={15}/></Link>; }
function MiniPerformance({ rows = [], mode }: { rows?: any[]; mode: Role }) {
  const recent = rows.slice(-6);
  const max = Math.max(1, ...recent.map((r) => Number(mode === "admin" ? r.bookings : r.earnings)));
  if (!recent.length) return <div className="chart-empty"><TrendingUp size={25}/><b>Performance data will appear here</b><span>Once your marketplace activity grows, monthly trends will be shown here.</span></div>;
  return <div className="mini-chart-wrap"><div className="mini-chart-y"><span>{mode === "admin" ? "Bookings" : "Earnings"}</span><span>{mode === "admin" ? "Monthly" : "৳ BDT"}</span></div><div className="mini-chart">{recent.map((row, index) => { const val = Number(mode === "admin" ? row.bookings : row.earnings); return <div className="mini-chart-column" key={`${row.month}-${index}`}><div className="mini-chart-bar-area"><div className="mini-chart-bar" style={{ height: `${Math.max(5, (val / max) * 100)}%` }} title={mode === "admin" ? `${val} bookings` : money(val)}><span>{mode === "admin" ? val : money(val)}</span></div></div><small>{String(row.month || "").slice(5) || row.month}</small></div>; })}</div></div>;
}
