import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header, Footer } from "@/components/Shell";
export const metadata = {
  title: "GEARVAULT | Rent the right equipment",
  description: "A smarter marketplace for professional equipment rentals.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
