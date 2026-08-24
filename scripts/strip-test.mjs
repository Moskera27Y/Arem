// Unit test for the language-switch path builder (exact copy of the logic in
// lib/i18n/config.ts and components/layout/LanguageSwitcher.tsx).
// Usage: node scripts/strip-test.mjs

function stripLocale(pathname) {
  const match = pathname.match(/^\/(en|es)(\/|$)/);
  if (!match) return pathname;
  const separator = match[2];
  const after = pathname.slice(match[0].length);
  return separator === "/" ? `/${after}` : "/";
}

function switchTo(pathname, target) {
  const rest = stripLocale(pathname);
  return `/${target}${rest === "/" ? "" : rest}`;
}

const cases = [
  ["/es", "en", "/en"],
  ["/en", "es", "/es"],
  ["/es/", "en", "/en"],
  ["/en/", "es", "/es"],
  ["/es/shop", "en", "/en/shop"],
  ["/en/shop", "es", "/es/shop"],
  ["/es/collections", "en", "/en/collections"],
  ["/en/collections", "es", "/es/collections"],
  ["/es/collections/raiz", "en", "/en/collections/raiz"],
  ["/en/regions/la-guajira", "es", "/es/regions/la-guajira"],
  ["/es/stories/tejer-el-desierto", "en", "/en/stories/tejer-el-desierto"],
  ["/es/products/wayuu-mochila-katsu", "en", "/en/products/wayuu-mochila-katsu"],
];

let failures = 0;
for (const [pathname, target, expected] of cases) {
  const got = switchTo(pathname, target);
  const ok = got === expected;
  if (!ok) failures++;
  console.log(`[${ok ? "OK " : "FAIL"}] ${pathname} -> ${target} = ${got}${ok ? "" : ` (expected ${expected})`}`);
}
console.log(failures === 0 ? "\nstripLocale: ALL PASS" : `\nstripLocale: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
