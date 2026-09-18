/** PDP loading skeleton — gallery + info column. */
export default function ProductLoading() {
  return (
    <div className="section" aria-busy="true" aria-label="Cargando producto">
      <div className="container">
        <div className="pdp">
          <div>
            <div className="sk-card shimmer" style={{ aspectRatio: "4 / 4.6" }} />
            <div className="sk-row" style={{ padding: "1rem 0 0" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sk-chip shimmer" style={{ width: "4.5rem", height: "4.5rem", borderRadius: "8px" }} />
              ))}
            </div>
          </div>
          <div>
            <div className="sk-title shimmer" />
            <div className="sk-line shimmer" style={{ marginTop: "1rem" }} />
            <div className="sk-line shimmer" style={{ width: "60%" }} />
            <div className="sk-line shimmer" style={{ width: "8rem", height: "3rem", borderRadius: "8px", marginTop: "2rem" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
