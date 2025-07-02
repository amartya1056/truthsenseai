import React from 'react';
import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ComingSoonSection from '../components/landing/ComingSoonSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ComingSoonSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;