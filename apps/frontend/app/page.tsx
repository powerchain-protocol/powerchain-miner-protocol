import { AgentComputeSection } from "@/components/sections/AgentComputeSection";
import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { HeroSection } from "@/components/sections/HeroSection";
import { MobileSection } from "@/components/sections/MobileSection";
import { ProofFlowSection } from "@/components/sections/ProofFlowSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeatureGrid />
        <ProofFlowSection />
        <ArchitectureSection />
        <AgentComputeSection />
        <MobileSection />
        <SecuritySection />
      </main>
      <SiteFooter />
    </>
  );
}
