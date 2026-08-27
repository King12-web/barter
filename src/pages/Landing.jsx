import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import FeatureMatch from "../components/FeatureMatch.jsx";
import FeatureCampus from "../components/FeatureCampus.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import WhyUs from "../components/WhyUs.jsx";
import FAQ from "../components/FAQ.jsx";
import FinalCTA from "../components/FinalCTA.jsx";
import Footer from "../components/Footer.jsx";

function Landing() {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeatureMatch />
      <FeatureCampus />
      <HowItWorks />
      <WhyUs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default Landing;