import { mediaBg } from "@/lib/media";
import { flagshipBookingHref } from "@/lib/fareharbor";

/**
 * The three stacked hero images. `gradient` is the placeholder; set `image` to
 * a photo path (e.g. `/images/hero/hunter-valley.jpg`) to swap in real
 * photography — the gradient stays behind as a loading / missing fallback.
 */
const HERO_MEDIA: {
  cls: string;
  label: string;
  gradient: string;
  image?: string;
}[] = [
  {
    cls: "ph1",
    label: "Hunter Valley",
    gradient: "linear-gradient(150deg,#8FB31E,#3C4A14)",
    // image: "/images/hero/hunter-valley.jpg",
  },
  {
    cls: "ph2",
    label: "Your chef on the road",
    gradient: "linear-gradient(150deg,#FF7A2E,#D63E00)",
    // image: "/images/hero/chef-on-the-road.jpg",
  },
  {
    cls: "ph3",
    label: "Blue Mountains",
    gradient: "linear-gradient(150deg,#19B3B3,#0A6E6E)",
    // image: "/images/hero/blue-mountains.jpg",
  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">Small-group &amp; private tours · Sydney NSW</p>
          <h1>
            A day out, <em>composed</em> like a tasting menu.
          </h1>
          <p>
            Owner-operated food, wine and adventure tours across New South Wales.
            Pick the place, set your group, choose your extras — and watch the
            price add up as you go.
          </p>
          <div className="hero-cta">
            <a href="#builder" className="btn btn-primary">
              Build your tour →
            </a>
            <a href={flagshipBookingHref()} className="btn btn-ghost">
              Join the Wednesday tour
            </a>
          </div>
        </div>
        <div className="stack">
          {HERO_MEDIA.map((m) => (
            <div
              key={m.cls}
              className={`ph ${m.cls}`}
              style={{ background: mediaBg(m.gradient, m.image) }}
            >
              <span>{m.label}</span>
            </div>
          ))}
          <div className="tag">★ 30 years in food &amp; wine</div>
        </div>
      </div>
    </section>
  );
}
