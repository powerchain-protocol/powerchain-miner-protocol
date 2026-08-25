import "@powerchain/design-system/css";
import "./site.css";
import type { Metadata, Viewport } from "next";
import { PWA } from "@/components/PWA";

export const metadata: Metadata = {
  title: {
    default: "PowerChain Renewable Miner OS",
    template: "%s · PowerChain",
  },
  description:
    "Proof-of-Energy infrastructure for renewable energy nodes, evidence verification and Solana settlement.",
  applicationName: "PowerChain Renewable Miner OS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand-mark.svg",
    apple: "/brand-mark.svg",
  },
  metadataBase: new URL("https://powerchain.ventures"),
  openGraph: {
    title: "PowerChain Renewable Miner OS",
    description:
      "Renewable-energy useful-work nodes with verifiable evidence and wallet-authorized settlement.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0B3D25",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PWA />
        {children}
      </body>
    </html>
  );
}
