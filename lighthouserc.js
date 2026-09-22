/* global module */
// Lighthouse CI configuration
// Install: npm install -g @lhci/cli
// Run: npx lhci autorun  (CI mode)  |  npx lhci server --watch  (local preview)
// Doc: https://github.com/GoogleChrome/lighthouse-ci

module.exports = {
  ci: {
    collect: {
      // Next.js SSG outputs a single-page shell; let LHCI build it first.
      staticDistDir: "./out",
      numberOfRuns: 3,
      settings: {
        // Emulate a mid-tier mobile device (Moto G4) + throttled network.
        onlyCategories: ["accessibility", "best-practices", "performance", "seo"],
        formFactor: "desktop",
        screenEmulation: {
          mobileViewportSize: "375x667",
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        // Hard gates that block deploy if violated.
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        // Legal / trust signals we audited.
        "document-title": "error",
        "has-html-doctype": "error",
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Must have structured data (JSON-LD Organization).
        "structured-data-structured-data": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      port: 8080,
      open: "http://localhost:8080",
      host: "0.0.0.0",
    },
  },
};
