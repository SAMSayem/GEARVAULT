"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
export default function Dashboard() {
  const [user, setUser] = useState<any>(null),
    [data, setData] = useState<any>({}),
    [error, setError] = useState("");
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("gv_user") || "null");
      setUser(u);
      if (!u) {
        location.href = "/login";
        return;
      }
      const path =
        u.role === "admin"
          ? "/users/analytics/admin"
          : "/users/analytics/owner";
      api(path)
        .then(setData)
        .catch((e) => setError(e.message));
    } catch {
      location.href = "/login";
    }
  }, []);
  if (!user) return <div className="container empty">Loading dashboard...</div>;
  return (
    <div className="container">
      <div className="page-top">
        <div className="eyebrow">YOUR GEARVAULT</div>
        <h1>Welcome, {user.name}</h1>
        <p className="section-sub">Your {user.role} workspace at a glance.</p>
      </div>
      <div className="dashboard-grid">
        {Object.entries(data).map(([k, v]) => (
          <div className="metric" key={k}>
            <span>{k.replace(/[A-Z]/g, " $&")}</span>
            <strong>{String(v)}</strong>
          </div>
        ))}
      </div>
      {error && <p className="muted">{error}</p>}
      <div className="grid-3">
        <Link className="category" href="/dashboard/profile">
          <h3>My Profile ↗</h3>
          <p>Update your contact details.</p>
        </Link>
        {user.role === "customer" ? (
          <>
            <Link className="category" href="/dashboard/bookings">
              <h3>My Bookings ↗</h3>
              <p>View your rental history.</p>
            </Link>
            <Link className="category" href="/dashboard/favorites">
              <h3>My Favorites ↗</h3>
              <p>Equipment saved for later.</p>
            </Link>
          </>
        ) : (
          <Link className="category" href="/dashboard/equipment">
            <h3>Manage Equipment ↗</h3>
            <p>Add and update your listings.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
