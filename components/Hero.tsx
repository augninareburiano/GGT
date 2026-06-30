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
            <a href="#" className="btn btn-ghost">
              Join the Wednesday tour
            </a>
          </div>
        </div>
        <div className="stack">
          <div className="ph ph1">
            <span>Hunter Valley</span>
          </div>
          <div className="ph ph2">
            <span>Your chef on the road</span>
          </div>
          <div className="ph ph3">
            <span>Blue Mountains</span>
          </div>
          <div className="tag">★ 30 years in food &amp; wine</div>
        </div>
      </div>
    </section>
  );
}
