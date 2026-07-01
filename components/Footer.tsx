import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <div className="brand" style={{ color: "var(--oat)" }}>
            Gourmet<span>.</span>Getaway
          </div>
          <p
            style={{
              opacity: 0.7,
              marginTop: 10,
              fontSize: 14,
              maxWidth: "30ch",
            }}
          >
            Food, wine &amp; adventure tours from Sydney, New South Wales.
          </p>
        </div>

        <div>
          <h5>Tours</h5>
          <Link href="/#wednesday">Wednesday Hunter Valley</Link>
          <Link href="/#private">Private tours</Link>
          <Link href="/#builder">Build your tour</Link>
        </div>

        <div>
          <h5>Company</h5>
          <Link href="/#about">About Jimmy</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#gift-cards">Gift cards</Link>
        </div>

        <div>
          <h5>Get in touch</h5>
          <a href="tel:+61416139567">+61 416 139 567</a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
