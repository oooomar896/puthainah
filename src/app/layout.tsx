import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/index.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Get build time from environment variable
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Buthaina Business - منصة بثينة أعمال",
  description: "المنصة الرائدة في التصميم الداخلي وصناعة الأثاث الفاخر - Buthaina Business for Interior Design",
  icons: {
    icon: "/vite.png",
    shortcut: "/vite.png",
    apple: "/vite.png",
  },
  other: {
    "last-update": buildTime,
    "app-version": process.env.npm_package_version || "1.0.0",
  },
};

import ServiceWorkerUnregister from "@/components/shared/ServiceWorkerUnregister";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ServiceWorkerUnregister />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem('lang')||'ar';var d=l==='ar'?'rtl':'ltr';var h=document.documentElement;h&&h.setAttribute('lang',l);h&&h.setAttribute('dir',d);}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_TIME__ = "${buildTime}";`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
