import { Hero } from "../components/hero";
import { Calculator } from "../components/calculator";
import { HowItWorks } from "../components/how-it-works";
import { TariffTable } from "../components/tariff-table";
import { FAQ } from "../components/faq";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <section id="tariffs">
        <TariffTable />
      </section>
      <Calculator />
      <section id="faq">
        <FAQ />
      </section>
    </main>
  );
}
