import "server-only";
import { q } from "./db";
import { SUPPORTED_CURRENCIES } from "@/lib/money";

/** A pluggable USD-base exchange-rate provider. Swap the implementation
 * (e.g. to a keyed provider) without touching callers. */
export interface RateProvider {
  name: string;
  /** Returns a map of currency code -> units per 1 USD (e.g. { COP: 4000 }). */
  fetchUsdRates(): Promise<Record<string, number>>;
}

// Default provider: open.er-api.com is keyless and covers every supported
// currency against USD. It requires no secret, so nothing is exposed.
class OpenErApiProvider implements RateProvider {
  name = "open.er-api.com";
  async fetchUsdRates(): Promise<Record<string, number>> {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`rate provider ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) throw new Error("rate provider returned no rates");
    return data.rates;
  }
}

const provider: RateProvider = new OpenErApiProvider();

export interface RatesResult {
  rates: Record<string, number>;
  updatedAt: string | null;
  source: string | null;
}

const USABLE = SUPPORTED_CURRENCIES as readonly string[];

function sanitize(rates: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of USABLE) {
    const v = Number(rates[c]);
    if (Number.isFinite(v) && v > 0) out[c] = c === "USD" ? 1 : v;
  }
  if (!out.USD) out.USD = 1;
  return out;
}

async function cache(rates: Record<string, number>, source: string, fetchedAt: string): Promise<void> {
  for (const c of USABLE) {
    const rate = rates[c];
    if (!rate) continue;
    const num = Number.isFinite(rate) ? rate : 0;
    await q(
      `insert into public.exchange_rates (base_currency, currency, rate, source, fetched_at)
       values ('USD', $1, $2, $3, $4)
       on conflict (base_currency, currency) do update set rate = $2, source = $3, fetched_at = $4`,
      [c, num, source, fetchedAt],
    );
  }
}

async function mostRecentCache(): Promise<RatesResult | null> {
  const rows = await q<{ currency: string; rate: string; source: string | null; fetched_at: string }>(
    "select currency, rate, source, fetched_at from public.exchange_rates where base_currency = 'USD' order by fetched_at desc limit 12",
  );
  if (rows.length === 0) return null;
  const rates: Record<string, number> = {};
  let updatedAt: string | null = null;
  let source: string | null = null;
  for (const r of rows) {
    if (r.currency === "USD") continue;
    const v = Number(r.rate);
    if (Number.isFinite(v) && v > 0) rates[r.currency] = v;
    if (!updatedAt || r.fetched_at > updatedAt) updatedAt = r.fetched_at;
    source = r.source ?? source;
  }
  rates.USD = 1;
  return { rates, updatedAt, source };
}

/** Latest USD-base rates: try the provider, on failure fall back to the most
 * recent successful cache. Never throws for transient provider failure. */
export async function getRates(): Promise<RatesResult> {
  try {
    const raw = await provider.fetchUsdRates();
    const rates = sanitize(raw);
    const fetchedAt = new Date().toISOString();
    await cache(rates, provider.name, fetchedAt);
    return { rates, updatedAt: fetchedAt, source: provider.name };
  } catch {
    const cached = await mostRecentCache();
    if (cached) return cached;
    // Last resort: USD-only (rate 1) so the storefront still renders.
    return { rates: { USD: 1 }, updatedAt: null, source: null };
  }
}

/** Single currency rate, with USD=1 always. */
export async function getRate(currency: string): Promise<number> {
  if (currency === "USD") return 1;
  const r = await getRates();
  return r.rates[currency] ?? 1;
}
