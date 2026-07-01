import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Shared chrome for every public page. The `(site)` route group keeps the
// admin section (app/admin) out of this shell.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
