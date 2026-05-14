import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Journeys from "@/components/Journeys";
import Why from "@/components/Why";
import NewsletterReprise from "@/components/NewsletterReprise";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Journeys />
        <Why />
        <NewsletterReprise />
      </main>
      <Footer />
    </>
  );
}
