import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
