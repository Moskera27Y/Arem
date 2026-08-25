import "server-only";
import { q } from "./db";
import type { SocialNetwork } from "@/lib/admin/types";

export interface SocialRow {
  id: string;
  network: string;
  label: string | null;
  value: string;
  active: boolean;
  display_order: number;
  post_url: string | null;
  created_at: string;
  updated_at: string;
}

// Default seed (mirrors the original Admin localStorage defaults).
const DEFAULT_SOCIALS: { id: string; network: SocialNetwork; label: string; value: string }[] = [
  { id: "soc-instagram", network: "instagram", label: "@arem.world", value: "https://instagram.com/arem.world" },
  { id: "soc-tiktok", network: "tiktok", label: "@arem.world", value: "https://tiktok.com/@arem.world" },
  { id: "soc-pinterest", network: "pinterest", label: "AREM WORLD", value: "https://pinterest.com/aremworld" },
  { id: "soc-facebook", network: "facebook", label: "AREM WORLD", value: "https://facebook.com/arem.world" },
  { id: "soc-whatsapp", network: "whatsapp", label: "WhatsApp", value: "+57 300 123 4567" },
  { id: "soc-email", network: "email", label: "hola@arem.world", value: "hola@arem.world" },
];

export async function listSocialLinks(opts: { activeOnly?: boolean; network?: string } = {}): Promise<SocialRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts.activeOnly) clauses.push("active = true");
  if (opts.network) {
    params.push(opts.network);
    clauses.push(`network = $${params.length}`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  return q<SocialRow>(`select * from public.social_links ${where} order by display_order, created_at`, params);
}

export async function upsertSocialLink(link: {
  id?: string;
  network: SocialNetwork;
  label?: string | null;
  value: string;
  active?: boolean;
  displayOrder?: number;
  postUrl?: string | null;
}): Promise<SocialRow> {
  const id = link.id ?? `soc-${Math.random().toString(36).slice(2, 10)}`;
  const rows = await q<SocialRow>(
    `insert into public.social_links (id, network, label, value, active, display_order, post_url)
     values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (id) do update set network=$2, label=$3, value=$4, active=$5, display_order=$6, post_url=$7, updated_at=now()
     returning *`,
    [id, link.network, link.label || null, link.value, link.active ?? true, link.displayOrder ?? 0, link.postUrl || null],
  );
  return rows[0];
}

export async function deleteSocialLink(id: string): Promise<void> {
  await q("delete from public.social_links where id = $1", [id]);
}

/** Seed defaults once (on first public read) so the storefront is never empty. */
export async function seedSocialLinks(): Promise<void> {
  const existing = await q("select id from public.social_links limit 1");
  if (existing.length > 0) return;
  for (const [i, s] of DEFAULT_SOCIALS.entries()) {
    await upsertSocialLink({ ...s, active: true, displayOrder: i + 1 });
  }
}
