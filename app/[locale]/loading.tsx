/** Route loading skeleton (App Router) — warm shimmer while sections stream. */
export default function LocaleLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <div className="sk-hero shimmer" />
      <div className="container">
        <div className="sk-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sk-chip shimmer" />
          ))}
        </div>
        <div className="sk-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sk-card shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
