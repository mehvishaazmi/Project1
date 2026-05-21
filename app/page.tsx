import Navbar from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SmartSearch } from "@/components/SmartSearch";
import { Destinations } from "@/components/Destinations";
import { BuddyMatching } from "@/components/BuddyMatching";
import { ExpenseSplit } from "@/components/ExpenseSplit";
import { Features } from "@/components/Features";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <SmartSearch />
        <Destinations />
        <BuddyMatching />
        <ExpenseSplit />
        <Features />
        <Testimonials />
        <CTA />        
      </main>
      <Footer />
    </div>
    
  );
};

export default Index;
