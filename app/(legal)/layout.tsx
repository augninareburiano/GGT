import CurrencyProvider from "@/components/CurrencyProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Shell for the policy pages. Same header and footer as the home page — the
 * CurrencyProvider is here only so the footer's currency picker behaves the
 * same way it does everywhere else; nothing on these pages is priced.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrencyProvider>
      {/* legal-shell keeps the footer on the bottom edge — these pages are
          short enough to leave a band of paper under it otherwise. */}
      <div className="legal-shell">
        <Header />
        <main className="legal">
          <div className="wrap legal-inner">{children}</div>
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  );
}
