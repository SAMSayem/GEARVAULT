import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = { title: "GearVault | Rent the right equipment", description: "A smarter marketplace for renting professional equipment." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><SiteHeader/><main>{children}</main><SiteFooter/><Toaster theme="dark" richColors position="top-right"/></body></html>; }
