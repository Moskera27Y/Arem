import "server-only";
import { q } from "./db";

export interface ContactConfig {
  id: number;
  title_en: string | null;
  title_es: string | null;
  intro_en: string | null;
  intro_es: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  hours_en: string | null;
  hours_es: string | null;
  form_button_en: string | null;
  form_button_es: string | null;
  email_active: boolean;
  whatsapp_active: boolean;
  address_active: boolean;
  hours_active: boolean;
  updated_at: string;
}

export async function getContact(): Promise<ContactConfig | null> {
  const rows = await q<ContactConfig>("select * from public.contact_config where id = 1");
  return rows[0] ?? null;
}

export async function updateContact(fields: Partial<ContactConfig>): Promise<ContactConfig> {
  const rows = await q<ContactConfig>(
    `update public.contact_config set
       title_en = $1, title_es = $2, intro_en = $3, intro_es = $4, email = $5, whatsapp = $6,
       address = $7, city = $8, country = $9, hours_en = $10, hours_es = $11,
       form_button_en = $12, form_button_es = $13,
       email_active = $14, whatsapp_active = $15, address_active = $16, hours_active = $17,
       updated_at = now()
     where id = 1 returning *`,
    [
      fields.title_en ?? null, fields.title_es ?? null,
      fields.intro_en ?? null, fields.intro_es ?? null,
      fields.email ?? null, fields.whatsapp ?? null,
      fields.address ?? null, fields.city ?? null, fields.country ?? null,
      fields.hours_en ?? null, fields.hours_es ?? null,
      fields.form_button_en ?? null, fields.form_button_es ?? null,
      fields.email_active ?? true, fields.whatsapp_active ?? true,
      fields.address_active ?? true, fields.hours_active ?? true,
    ],
  );
  return rows[0];
}
