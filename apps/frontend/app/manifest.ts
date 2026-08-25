import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PowerChain Renewable Miner OS",
    short_name: "PowerChain Miner",
    description:
      "Renewable energy node operations, Proof of Energy and rewards.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8F6",
    theme_color: "#0B3D25",
    icons: [
      {
        src: "/brand-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
