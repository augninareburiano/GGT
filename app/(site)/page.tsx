// Header and Footer come from the (site) layout shell, so the page only
// composes its own sections.
//
// TODO: restore the full homepage composition once these section components
// land (each is its own task/branch):
//
//   import Hero from "@/components/Hero";
//   import TwoDoors from "@/components/TwoDoors";
//   import StackingCards from "@/components/StackingCards";
//   import TourBuilder from "@/components/TourBuilder";
//   import JimmyStrip from "@/components/JimmyStrip";
//   import { getTours } from "@/lib/tours.server";
//
//   export const dynamic = "force-dynamic";
//
//   const tours = await getTours();
//   return (<><Hero /><TwoDoors /><StackingCards /><TourBuilder tours={tours} /><JimmyStrip /></>);

export default function Home() {
  return (
    <section className="hero">
      <div className="wrap">
        <p className="eyebrow">Small-group &amp; private tours · Sydney NSW</p>
        <h1 style={{ fontSize: "clamp(38px,5.5vw,68px)", marginTop: 12 }}>
          A day out, <em style={{ fontStyle: "normal", color: "var(--marmalade)" }}>composed</em> like a tasting menu.
        </h1>
        <p style={{ marginTop: 18, color: "#43403b", maxWidth: "40ch" }}>
          Homepage sections are coming soon. This placeholder confirms the shared
          header, footer and mobile menu wrap the page.
        </p>
      </div>
    </section>
  );
}
