// CMS expansion schema: admin contact config + collections + product pivot.
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
CREATE TABLE IF NOT EXISTS public.contact_config (
  id int PRIMARY KEY,
  title_en text, title_es text,
  intro_en text, intro_es text,
  email text, whatsapp text,
  address text, city text, country text,
  hours_en text, hours_es text,
  form_button_en text, form_button_es text,
  email_active boolean NOT NULL DEFAULT true,
  whatsapp_active boolean NOT NULL DEFAULT true,
  address_active boolean NOT NULL DEFAULT true,
  hours_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id text PRIMARY KEY,
  name_en text NOT NULL, name_es text NOT NULL,
  slug text UNIQUE NOT NULL,
  description_en text, description_es text,
  tagline_en text, tagline_es text,
  story_en text, story_es text,
  image_key text, image_url text, image_alt_en text, image_alt_es text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_collections (
  collection_id text NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_pc_product ON public.product_collections(product_id);
`;

await pool.query(ddl);

// Seed contact defaults from the current hardcoded site values (so the page
// isn't empty after deploy). Never destructive.
const c = await pool.query("select id from public.contact_config where id = 1");
if (c.rows.length === 0) {
  await pool.query(
    `insert into public.contact_config (id, title_en, title_es, intro_en, intro_es, email, whatsapp, address, city, country, hours_en, hours_es, form_button_en, form_button_es)
     values (1,'Contact','Contacto','Questions about a piece, an order or a partnership with artisans? Write to us — we reply within 24 business hours.','¿Preguntas sobre una pieza, un pedido o una alianza con artesanos? Escríbenos — respondemos en menos de 24 horas hábiles.','hola@arem.world','+57 300 123 4567','Carrera 7 # 45-12','Bogotá','Colombia','Mon – Fri · 9:00 – 18:00','Lun – Vie · 9:00 – 18:00','Send message','Enviar mensaje')
     on conflict (id) do nothing`,
  );
}

// Seed collections from the existing static content (same ids, slugs, productIds).
const { rows: staticCollections } = await pool.query(
  "select name_en, name_es, slug, description_en, description_es, tagline_en, tagline_es, story_en, story_es, image_key, image_url, image_alt_en, image_alt_es, is_active, sort_order from collections",
);
if (staticCollections.length === 0) {
  const colSeeds = [
    {
      id: "col-raiz", slug: "raiz", name: { en: "Raíz", es: "Raíz" },
      tagline: { en: "The heritage edit", es: "La edición de herencia" },
      description: {
        en: "Pieces that carry the deepest traditions — Wayuu weaving, Ráquira clay, highland wool. Objects of origin, made to outlive trends.",
        es: "Piezas que cargan las tradiciones más profundas — tejido wayuu, barro de Ráquira, lana de altura. Objetos de origen, hechos para sobrevivir a las modas.",
      },
      story: {
        en: "Raíz gathers the objects that anchor Colombian craft: the mochila of the desert, the vase of the highlands, the ruana of the páramo. Each one is made by hands that learned from hands.",
        es: "Raíz reúne los objetos que anclan el oficio colombiano: la mochila del desierto, la vasija de la altura, la ruana del páramo. Cada una está hecha por manos que aprendieron de manos.",
      },
      image: { src: "/images/cat-textiles.svg", alt: { en: "Heritage edit — woven textiles", es: "Edición de herencia — textiles tejidos" } },
      productIds: ["pr-mochila-katsu", "pr-vasija-raiz", "pr-ruana-paramo", "pr-collar-andino"], order: 1,
    },
    {
      id: "col-hecha-mano", slug: "hecha-a-mano", name: { en: "Hecho a Mano", es: "Hecho a Mano" },
      tagline: { en: "Everyday handmade", es: "Hecho a mano para el día a día" },
      description: {
        en: "The daily objects of Colombian life, made by hand and priced fairly — bags, belts and table pieces for the way you actually live.",
        es: "Los objetos diarios de la vida colombiana, hechos a mano y con precio justo — bolsos, cinturones y piezas de mesa para la forma en que de verdad vives.",
      },
      story: {
        en: "Handmade should not mean precious-only. This edit is for the pieces you reach for every day, made with the same care as the heirlooms.",
        es: "Hecho a mano no debería significar solo piezas de vitrina. Esta edición es para las piezas que usas todos los días, hechas con el mismo cuidado que las herencias.",
      },
      image: { src: "/images/cat-bags.svg", alt: { en: "Everyday handmade edit", es: "Edición hecha a mano para el día a día" } },
      productIds: ["pr-mochila-katsu", "pr-ruana-paramo", "pr-bolso-monte", "pr-cinturon-sendero"], order: 2,
    },
    {
      id: "col-cafe", slug: "cafe-de-colombia", name: { en: "Café de Colombia", es: "Café de Colombia" },
      tagline: { en: "The origin, roasted", es: "El origen, tostado" },
      description: {
        en: "Direct-trade coffees from the families who grow them — the Eje Cafetero, the Sierra Nevada, the highlands. Fresh roast, honest origin.",
        es: "Cafés de comercio directo de las familias que los cultivan — el Eje Cafetero, la Sierra Nevada, la altura. Tueste fresco, origen honesto.",
      },
      story: {
        en: "Coffee is Colombia's craft economy at its most personal. We work with growers who control their own process, from cherry to roast.",
        es: "El café es la economía artesanal de Colombia en su forma más personal. Trabajamos con cultivadores que controlan su propio proceso, de la cereza al tueste.",
      },
      image: { src: "/images/cat-coffee.svg", alt: { en: "Café de Colombia collection", es: "Colección Café de Colombia" } },
      productIds: ["pr-cafe-altura", "pr-cafe-sierra"], order: 3,
    },
    {
      id: "col-caribe", slug: "caribe", name: { en: "Caribe", es: "Caribe" },
      tagline: { en: "Coastal living", es: "Vida costera" },
      description: {
        en: "The colour and rhythm of the Caribbean coast: hammocks for the afternoon, baskets from the market, sea and salt in every palette.",
        es: "El color y el ritmo de la costa caribe: hamacas para la tarde, canastos del mercado, mar y sal en cada paleta.",
      },
      story: {
        en: "The coast makes craft for rest and celebration. This edit brings a little of its breeze to your home.",
        es: "La costa hace oficio para el descanso y la celebración. Esta edición lleva un poco de su brisa a tu hogar.",
      },
      image: { src: "/images/r-caribe.svg", alt: { en: "Caribe collection — coastal living", es: "Colección Caribe — vida costera" } },
      productIds: ["pr-hamaca-brisa", "pr-canasto-norte", "pr-cafe-sierra"], order: 4,
    },
  ];
  for (const c of colSeeds) {
    await pool.query(
      `insert into public.collections (id, name_en, name_es, slug, description_en, description_es, tagline_en, tagline_es, story_en, story_es, image_key, image_url, image_alt_en, image_alt_es, is_active, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15)
       on conflict (id) do nothing`,
      [
        c.id, c.name.en, c.name.es, c.slug,
        c.description.en, c.description.es, c.tagline.en, c.tagline.es,
        c.story.en, c.story.es, c.image.src, null, c.image.alt.en, c.image.alt.es,
        c.order,
      ],
    );
    for (const pid of c.productIds) {
      await pool.query(
        "insert into public.product_collections (collection_id, product_id) values ($1,$2) on conflict do nothing",
        [c.id, pid],
      );
    }
  }
}

const { rows: tbl } = await pool.query(
  "select tablename from pg_tables where schemaname='public' and tablename in ('contact_config','collections','product_collections')"
);
console.log("tables:", tbl.map((r) => r.tablename).join(", "));
const { rows: cols } = await pool.query("select id from public.collections limit 5");
console.log("collections seeded:", cols.length);
await pool.end();
