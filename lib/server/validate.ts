import "server-only";

export function isEmail(s: string): boolean {
  return s.length > 0 && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function asString(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function asEmail(v: unknown): string {
  const s = asString(v, 254).toLowerCase();
  return isEmail(s) ? s : "";
}
