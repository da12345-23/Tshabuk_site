import type { Metadata } from "next";
import { Baloo_Bhaijaan_2, Cairo, Nunito } from "next/font/google";
import { LocaleProvider } from "@/lib/locale-context";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "تشابك | TASHABUK",
  description:
    "تشابك — حملة توعوية حول الاضطرابات العصبية العضلية عند الأطفال. Tashabuk — a charity campaign raising awareness about neuromuscular disorders in children.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${baloo.variable} ${cairo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-texture">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
