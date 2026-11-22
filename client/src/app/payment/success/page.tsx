"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiToken, API_URL } from "@/lib/api";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Checking your payment confirmation…");

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const id = new URLSearchParams(window.location.search).get("session_id");
      if (!id) {
        setStatus("Payment session reference is missing.");
        return;
      }

      try {
        const token = await getApiToken();
        // Stripe webhooks can arrive just after the browser redirect. Retry briefly
        // instead of incorrectly showing a failed payment on the first lookup.
        for (let attempt = 0; attempt < 8 && !cancelled; attempt += 1) {
          const response = await fetch(
            `${API_URL}/payments/session/${encodeURIComponent(id)}`,
            { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
          );
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            setStatus("Your payment was confirmed and your rental booking is recorded.");
            return;
          }
          if (response.status !== 404) {
            setStatus(data.message || "We could not verify this payment. Please contact support.");
            return;
          }
          if (attempt < 7) await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (!cancelled) {
          setStatus("Payment is still being processed. Please refresh this page in a moment.");
        }
      } catch {
        if (!cancelled) setStatus("Sign in again to view your payment confirmation.");
      }
    }

    verifyPayment();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container grid min-h-[65vh] place-items-center py-16 text-center">
      <div className="glass max-w-lg rounded-3xl p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300">✓</div>
        <h1 className="mt-6 text-3xl font-black">Thanks for your booking.</h1>
        <p className="mt-4 text-sm leading-6 text-gray-400">{status}</p>
        <Link href="/dashboard" className="btn-primary mt-7">Go to dashboard</Link>
      </div>
    </div>
  );
}
