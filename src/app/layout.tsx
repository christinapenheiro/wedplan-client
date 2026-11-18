import type { Metadata } from "next";
import { Lato } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WedPlan — Wedding Planning Platform",
  description: "Seamless wedding planning, guest RSVPs, budgets, vendor directory, and timelines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lato.variable} ${lato.className}`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
