/**
 * AR❀EM — logotipo central del Hero.
 * Letras serif con textura foil dorado brillante + flor central ❀ con núcleo blanco.
 * Efectos premium: shimmer constante, halo orbitario, glitter CSS, trail de luz.
 */
export function ARREM({ animated = true }: { animated?: boolean }) {
  return (
    <>
      {/* Letra AR con foil dorado brillante */}
      <span
        className="hero__brand-letter hero__brand-letter--a"
        style={{ animationDelay: "0s" }}
      >
        AR
      </span>

      {/* Flor central ❀ con brillo pulsátil + glitter */}
      <span
        className="hero__brand-flower"
        aria-hidden="true"
        style={animated ? undefined : { animationDelay: "0s" }}
      >
        ❀
      </span>

      {/* Letra EM con foil */}
      <span
        className="hero__brand-letter hero__brand-letter--em"
        style={{ animationDelay: "0.3s" }}
      >
        EM
      </span>

      {/* Glitter dorado disperso alrededor del logo (CSS puro) */}
      {animated && <Glitter />}
    </>
  );
}

/** Partículas glitter dorado estáticas alrededor del logo */
function Glitter() {
  const particles = Array.from({ length: 12 });
  return (
    <>
      {particles.map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 55 + Math.sin(i) * 25;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const delay = i * 0.15;
        return (
          <span
            key={i}
            className="hero__glitter"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              animationDelay: `${delay}s`,
              width: `${2 + Math.sin(i) * 1.5}px`,
              height: `${2 + Math.sin(i) * 1.5}px`,
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}
