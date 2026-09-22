import React from "react";

interface ARREMProps {
  /** Si true, anima el brillo y la flor */
  animated?: boolean;
  /** Tamaño base (rem) — se escala responsivamente */
  size?: number;
}

/**
 * AR❀EM — logotipo central del Hero.
 * Letras serif negras "AR"/"EM" con textura foil dorada (background-clip text +
 * pseudo-element shimmer). La flor central ❀ brilla con halo dorado orbitario.
 * Responsive: usa rem/clamp, no JS.
 */
export function ARREM({ animated = true, size = 5.5 }: ARREMProps) {
  return (
    <div
      className="hero__brand-mark"
      style={{
        fontSize: `${size}rem`,
        // Posicionamiento centrado horizontal, flotando arriba del hero content
        position: "absolute",
        top: "clamp(4rem, 8vw, 6rem)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {/* Letra AR con foil */}
      <span
        className="hero__brand-letter hero__brand-letter--first"
        style={{ animationDelay: "0s" }}
      >
        AR
      </span>
      {/* Flor central ❀ con halo animado */}
      <span
        className="hero__brand-flower"
        aria-hidden="true"
        style={{
          animationDelay: "0.2s",
          // Pequeño offset vertical para alinear con el baseline del texto
          position: "relative",
          top: "-0.08em",
        }}
      >
        ❀
      </span>
      {/* Letra EM con foil */}
      <span
        className="hero__brand-letter hero__brand-letter--last"
        style={{ animationDelay: "0.4s" }}
      >
        EM
      </span>

      {/* Halo dorado orbitario (solo visible en desktop y no reduced-motion) */}
      {animated && (
        <span
          className="hero__brand-halo"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
