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
      {animated && (
        <>
          <Glitter />
          <FlowerSparkles />
        </>
      )}
    </>
  );
}

/** Polvo de oro sobre las letras: 22 partículas con destello escalonado */
function Glitter() {
  const particles = Array.from({ length: 22 });
  return (
    <>
      {particles.map((_, i) => {
        const angle = (i / 22) * Math.PI * 2 + (i % 2) * 0.14;
        const dist = 60 + Math.abs(Math.sin(i * 2.3)) * 75;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist * 0.7;
        const delay = (i * 0.22) % 2.8;
        const size = 2 + Math.abs(Math.sin(i * 1.7)) * 2.5;
        return (
          <span
            key={i}
            className="hero__glitter"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              animationDelay: `${delay}s`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}

/** Destellos estrella (✦) alrededor de la flor central */
function FlowerSparkles() {
  const sparks = [
    { left: "44%", top: "2%", size: "1rem", delay: "0s" },
    { left: "59%", top: "20%", size: "0.7rem", delay: "0.8s" },
    { left: "40%", top: "66%", size: "0.75rem", delay: "1.4s" },
    { left: "61%", top: "76%", size: "1rem", delay: "0.45s" },
    { left: "52%", top: "-10%", size: "0.6rem", delay: "1.9s" },
    { left: "34%", top: "36%", size: "0.55rem", delay: "1.1s" },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="hero__spark"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            animationDelay: s.delay,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}
    </>
  );
}
