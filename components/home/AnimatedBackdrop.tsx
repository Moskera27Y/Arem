/**
 * AnimatedBackdrop — fondo vivo global, acorde a AREM WORLD:
 * taller cálido/editorial (marfil, oro suave, terracota, verde andino)
 * + hilos de tejido en dibujo continuo.
 * CSS-only (transform/opacity/stroke en GPU), sin librerías, respeta
 * prefers-reduced-motion (fondo estático).
 */
export function AnimatedBackdrop() {
  return (
    <div className="arem-ambient" aria-hidden="true">
      <span className="arem-ambient__blob arem-ambient__blob--gold" />
      <span className="arem-ambient__blob arem-ambient__blob--clay" />
      <span className="arem-ambient__blob arem-ambient__blob--olive" />
      <span className="arem-ambient__blob arem-ambient__blob--sand" />
      <svg
        className="arem-ambient__threads"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-40,640 C300,570 480,770 760,705 S1200,570 1480,655"
          pathLength={100}
          stroke="#b4552d"
        />
        <path
          d="M-40,250 C260,310 520,170 820,230 S1240,310 1480,225"
          pathLength={100}
          stroke="#d9a441"
        />
        <path
          d="M990,90 C1110,180 1090,340 1195,430"
          pathLength={100}
          stroke="#7a8450"
        />
      </svg>
      <span className="arem-ambient__weave" />
      <span className="arem-ambient__grain" />
    </div>
  );
}
