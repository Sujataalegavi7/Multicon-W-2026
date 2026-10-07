import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__brand-wrap">
              <Image src="/tcet-logo_1.png" alt="TCET Logo" width={48} height={48} className="footer__logo" />
            </div>
            <p className="footer__tagline">
              Thakur College of Engineering &amp; Technology — Advancing knowledge through
              high-impact scholarly research, MULTICON-W conferences, and institutional
              technical excellence.
            </p>
          </div>

          {/* Links */}
          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__col-title">Navigation</h4>
              <Link href="/" className="footer__link">Home</Link>
              <Link href="/search" className="footer__link">Browse Papers</Link>
              <Link href="/login" className="footer__link">Contributor Login</Link>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Repository</h4>
              <Link href="/search?sort=newest" className="footer__link">Latest Papers</Link>
              <Link href="/search?featured=true" className="footer__link">Featured Research</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <p>© {new Date().getFullYear()} Thakur College of Engineering &amp; Technology (TCET). All rights reserved.</p>
            <div className="footer__bottom-links">
              <span>NAAC Grade &apos;A&apos; Autonomous Institute</span>
              <span style={{ color: "#374151" }}>·</span>
              <span>MULTICON-W Open Access Repository</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
