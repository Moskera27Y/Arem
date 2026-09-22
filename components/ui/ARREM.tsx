/**
 * AR❀EM — logotipo central del Hero.
 * Renderiza "AR❀EM" como texto con textura foil dorado (CSS gold shimmer)
 * y flor central ❀ brillante. El estilo lo aplica `.hero__brand-mark` en CSS,
 * este componente solo controla props de animación y accesibilidad.
 */
export function ARREM({ animated = true }: { animated?: boolean }) {
  return (
    <>
      <span className="hero__brand-letter hero__brand-letter--a" style={{ animationDelay: "0s" }}>
        AR
      </span>
      <span className="hero__brand-flower" aria-hidden="true" style={animated ? undefined : { animationDelay: "0s" }}>
        ❀
      </span>
      <span className="hero__brand-letter hero__brand-letter--em" style={{ animationDelay: "0.3s" }}>
        EM
      </span>
    </>
  );
}
