import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "lenis/dist/lenis.css";
import "../src/index.css";
import { PWARegistration } from "../src/components/PWARegistration";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://walk-talk-orbital-1028.vinicius-silva205.chatgpt.site",
  ),
  title: {
    default: "WALK TALK — Comunicação sem Fronteiras",
    template: "%s | WALK TALK",
  },
  description:
    "Conheça o WALK TALK e organize equipes, aparelhos e comunicação interna em um portal integrado. Explore também informações sobre saúde e ergonomia no trabalho.",
  openGraph: {
    title: "WALK TALK — Comunicação sem Fronteiras",
    description:
      "Tecnologia que aproxima. Um portal para conectar pessoas, equipes e operação.",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WALK TALK — Comunicação sem Fronteiras",
    images: ["/og-cover.png"],
  },
  icons: { icon: "/favicon.svg", apple: "/icons/icon-192.png" },
  manifest: "/manifest.json",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <PWARegistration />
      </body>
    </html>
  );
}
