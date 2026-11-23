import Link from "next/link";
import { Wrench } from "lucide-react";

export function BrandLogo({
  compact = false,
  footer = false,
}: {
  compact?: boolean;
  footer?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`brand-lockup ${footer ? "brand-lockup-footer" : ""}`}
      aria-label="GearVault home"
    >
      <span className="brand-symbol" aria-hidden="true">
        <Wrench size={compact ? 18 : 21} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="brand-wordmark">
          GEAR<span>VAULT</span>
          <small>EQUIPMENT RENTALS</small>
        </span>
      )}
    </Link>
  );
}
