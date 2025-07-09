import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LandingPageBody from "@/components/LandingPageBody";
import Footer from "@/components/Footer";
import ClientLandingWrapper from "@/components/ClientLandingWrapper";

export default function LandingPage() {
  return (
    <ClientLandingWrapper>
      <Navbar />
      <Hero />
      <LandingPageBody />
      <Footer />
    </ClientLandingWrapper>
  );
}
