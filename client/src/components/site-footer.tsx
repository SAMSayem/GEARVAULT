import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Package, Clock3 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <BrandLogo footer />
          <p className="footer-description">
            The equipment you need, for the time you need it. A smarter, more
            flexible way to keep every project moving.
          </p>
          <div className="footer-trust-points">
            <span>
              <ShieldCheck size={14} /> Secure rental process
            </span>
            <span>
              <Package size={14} /> Reviewed equipment listings
            </span>
            <span>
              <Clock3 size={14} /> Flexible rental periods
            </span>
          </div>
        </div>
        <div>
          <h3 className="footer-heading">Explore</h3>
          <div className="footer-links">
            <Link href="/equipment">Browse equipment</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/register">Become an owner</Link>
            <Link href="/dashboard">Your dashboard</Link>
          </div>
        </div>
        <div>
          <h3 className="footer-heading">Built for every big idea</h3>
          <p className="footer-trust">
            From essential tools to specialist equipment, GearVault helps people
            access the resources their projects need.
          </p>
          <Link href="/equipment" className="footer-marketplace-link">
            Explore the marketplace <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} GearVault. All rights reserved.
          </span>
          <span>Rent smarter. Build more.</span>
          <Link href="/equipment">
            Explore marketplace <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
