import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnimateOnScroll } from "@/components/providers/AnimateOnScroll";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "aos/dist/aos.css";
import "@/styles/legacy/home.css";
import "@/styles/legacy/responsive.css";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: { default: "Faith Explorers", template: "%s | Faith Explorers" },
  description: "Articles on faith, relationships, family and spiritual growth.",
  icons: { icon: "/images/faith.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Suspense>
          <AnimateOnScroll />
        </Suspense>
      </body>
    </html>
  );
}
