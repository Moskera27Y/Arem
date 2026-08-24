import Link from "next/link";

/** Fallback 404 for paths outside any locale (middleware normally redirects). */
export default function RootNotFound() {
  return (
    <section className="section" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container text-center">
        <p className="eyebrow eyebrow--center" style={{ justifyContent: "center" }}>
          Error 404
        </p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          This page doesn&apos;t exist
        </h1>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <Link href="/" className="btn btn--primary">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
