"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  UserRound,
  Users,
  ClipboardList,
  Heart,
  PlusCircle,
  ChartColumn,
  ArrowUpRight,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

type Role = "customer" | "owner" | "admin";
type Props = {
  role: Role;
  name?: string;
  image?: string;
  title: ReactNode;
  subtitle: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
};

const navigation = {
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: ChartColumn },
    { label: "All users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "All equipment",
      href: "/dashboard/admin/equipment",
      icon: Package,
    },
    {
      label: "All rentals",
      href: "/dashboard/admin/rentals",
      icon: ClipboardList,
    },
    { label: "My profile", href: "/dashboard/profile", icon: UserRound },
  ],
  owner: [
    { label: "Overview", href: "/dashboard/owner", icon: ChartColumn },
    { label: "Add equipment", href: "/dashboard/owner/add", icon: PlusCircle },
    {
      label: "My equipment",
      href: "/dashboard/owner/equipment",
      icon: Package,
    },
    {
      label: "Rental requests",
      href: "/dashboard/owner/rentals",
      icon: ClipboardList,
    },
    { label: "My profile", href: "/dashboard/profile", icon: UserRound },
  ],
  customer: [
    { label: "My rentals", href: "/dashboard/customer", icon: ClipboardList },
    { label: "Favorites", href: "/dashboard/customer/favorites", icon: Heart },
    { label: "My profile", href: "/dashboard/profile", icon: UserRound },
  ],
} satisfies Record<Role, { label: string; href: string; icon: any }[]>;

const roleLabel: Record<Role, string> = {
  customer: "Renter account",
  owner: "Equipment owner",
  admin: "Administrator",
};

export function DashboardShell({
  role,
  name,
  image,
  title,
  subtitle,
  eyebrow = "YOUR WORKSPACE",
  action,
  children,
}: Props) {
  const pathname = usePathname();
  const links = navigation[role];
  const initials =
    (name || "G")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "G";

  return (
    <section className="dashboard-page">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-brand">
            <span className="dashboard-sidebar-mark">
              <Wrench size={17} />
            </span>
            <div>
              <b>GearVault</b>
              <small>{roleLabel[role]}</small>
            </div>
          </div>
          <div className="dashboard-profile-mini">
            {image ? (
              <img src={image} alt="" />
            ) : (
              <span className="avatar-fallback">{initials}</span>
            )}
            <div className="min-w-0">
              <b>{name || "Your account"}</b>
              <small>{roleLabel[role]}</small>
            </div>
            <ShieldCheck size={16} className="profile-verified" />
          </div>
          <p className="sidebar-label">WORKSPACE</p>
          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            {links.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard/profile" &&
                  href !== "/dashboard/admin" &&
                  href !== "/dashboard/owner" &&
                  pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`dashboard-nav-link ${active ? "active" : ""}`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {active && <span className="nav-active-dot" />}
                </Link>
              );
            })}
          </nav>
          <div className="dashboard-sidebar-help">
            <span className="help-icon">
              <ShieldCheck size={17} />
            </span>
            <b>Your account is protected</b>
            <p>Manage your rentals and equipment from one secure workspace.</p>
            <Link href="/equipment">
              Explore marketplace <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="dashboard-subtitle">{subtitle}</p>
            </div>
            {action && <div className="dashboard-heading-action">{action}</div>}
          </header>
          {children}
        </main>
      </div>
    </section>
  );
}

export function DashboardEmpty({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="dashboard-empty">
      <span className="dashboard-empty-icon">
        <Package size={24} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link href={href} className="btn-primary">
          {action || "Explore equipment"}
        </Link>
      )}
    </div>
  );
}
