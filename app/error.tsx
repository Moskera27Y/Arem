"use client";

import Link from "next/link";

/**
 * Root-level (locale-less) error boundary. Only shown when a server component
 * throws outside a localized route, so the user always gets a branded 500
 * instead of a blank page.
 */
export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // eslint-disable-next-line no-console
  console.error(error);
  return (
    <section
      className="section"
      style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}
    >
      <div className="container text-center">
        <p
          className="eyebrow eyebrow--center"
          style={{ justifyContent: "center" }}
        >
          Error 500
        </p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          Something went wrong
        </h1>
        <p className="muted" style={{ maxWidth: "32rem", margin: "1.25rem auto 2rem" }}>
          We couldn&apos;t load this page. Please try again or head back home.
        </p>
        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/" className="btn btn--primary">
            Go home
          </Link>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </section>
  );
}
