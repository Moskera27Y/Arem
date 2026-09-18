/**
 * AnimatedBackdrop — fondo vivo del homepage, acorde a AREM WORLD:
 * taller cálido/editorial (marfil, oro suave, terracota, verde andino).
 * CSS-only (transform/opacity en GPU), sin librerías, respeta
 * prefers-reduced-motion (fondo estático).
 */
export function AnimatedBackdrop() {
  return (
    <div className="arem-ambient" aria-hidden="true">
      <span className="arem-ambient__blob arem-ambient__blob--gold" />
      <span className="arem-ambient__blob arem-ambient__blob--clay" />
      <span className="arem-ambient__blob arem-ambient__blob--olive" />
      <span className="arem-ambient__weave" />
      <span className="arem-ambient__grain" />
    </div>
  );
}
