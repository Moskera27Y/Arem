import type { Money, Product, ProductStatus } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

/**
 * Product catalog — bilingual (EN default / ES secondary).
 *
 * The full Phase 1 data model is preserved: multiple images, options
 * (color/size), variants with SKU and inventory, discounts, categories,
 * collections, region and artisan links. An Admin manages all of this per
 * locale in a later phase.
 */

const cop = (amount: number): Money => ({ amount, currency: "COP" });

interface VariantSeed {
  id: string;
  sku: string;
  title: Localized;
  values: Record<string, Localized>;
  price: number;
  compareAt?: number;
  inventory: number;
  imageSrc?: string;
}

interface OptionSeed {
  id: string;
  name: Localized;
  values: Localized[];
}

/** Bilingual product seed — the shape an Admin panel edits per locale. */
export interface ProductSeed {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  story: Localized[];
  details: Localized[];
  images: LocalizedImage[];
  price: Money;
  compareAtPrice?: Money;
  options: OptionSeed[];
  variants: VariantSeed[];
  categoryIds: string[];
  collectionIds: string[];
  regionId?: string;
  artisanId?: string;
  featured?: boolean;
  badge?: Localized;
  status: ProductStatus;
  createdAt: string;
}

export const productSeeds: ProductSeed[] = [
  {
    id: "pr-mochila-katsu",
    slug: "wayuu-mochila-katsu",
    name: L('Wayuu Mochila "Katsü"', 'Mochila Wayuu "Katsü"'),
    tagline: L("Woven by hand in La Guajira", "Tejida a mano en La Guajira"),
    description: L(
      "The mochila is the essential Wayuu object — woven in a continuous spiral with the crochet the Wayuu call 'kanas'. Each bag takes up to three weeks of work and no two are alike.",
      "La mochila es el objeto esencial wayuu — tejida en espiral continua con el crochet que los wayuu llaman 'kanas'. Cada bolso toma hasta tres semanas de trabajo y no hay dos iguales.",
    ),
    story: [
      L(
        "Katsü means 'star' in Wayuunaiki, and the pattern woven into this mochila recalls the constellations the Wayuu have read in the desert sky for generations.",
        "Katsü significa 'estrella' en wayuunaiki, y el patrón tejido en esta mochila evoca las constelaciones que los wayuu leen en el cielo del desierto desde hace generaciones.",
      ),
      L(
        "Amalia and her weaving circle work one bag at a time, from the first thread of the base to the final stitch of the strap. The cotton is soft, the weave is dense, and the bag carries its own quiet story.",
        "Amalia y su círculo de tejido trabajan un bolso a la vez, desde el primer hilo de la base hasta la puntada final de la correa. El algodón es suave, el tejido es denso, y el bolso carga su propia historia callada.",
      ),
    ],
    details: [
      L("100% handwoven cotton, natural and dyed", "Algodón 100 % tejido a mano, natural y teñido"),
      L("Made in Uribia, La Guajira — approx. 3 weeks of work", "Hecha en Uribia, La Guajira — aprox. 3 semanas de trabajo"),
      L("Height 30 cm · diameter 28 cm · strap 95 cm", "Alto 30 cm · diámetro 28 cm · correa 95 cm"),
      L("Spot clean with cold water; dry away from direct sun", "Limpieza puntual con agua fría; secar lejos del sol directo"),
      L("Each piece is unique; pattern placement may vary", "Cada pieza es única; la posición del patrón puede variar"),
    ],
    images: [
      {
        src: "/images/p-mochila-katsu-1.svg",
        alt: L("Wayuu mochila Katsü with star pattern", "Mochila wayuu Katsü con patrón de estrellas"),
        caption: L("The Katsü in cacao", "La Katsü en cacao"),
      },
      {
        src: "/images/p-mochila-katsu-2.svg",
        alt: L("Detail of the Wayuu mochila Katsü weave", "Detalle del tejido de la mochila wayuu Katsü"),
        caption: L("Handwoven kanas detail", "Detalle del kanas tejido a mano"),
      },
    ],
    price: cop(320000),
    compareAtPrice: cop(380000),
    options: [
      { id: "color", name: L("Color", "Color"), values: [L("Cacao", "Cacao"), L("Arena", "Arena"), L("Charcoal", "Carbón")] },
    ],
    variants: [
      { id: "mch-kat-cacao", sku: "MCH-KAT-CACAO", title: L("Cacao", "Cacao"), values: { color: L("Cacao", "Cacao") }, price: 320000, compareAt: 380000, inventory: 4 },
      { id: "mch-kat-arena", sku: "MCH-KAT-ARENA", title: L("Arena", "Arena"), values: { color: L("Arena", "Arena") }, price: 320000, compareAt: 380000, inventory: 2 },
      { id: "mch-kat-carbon", sku: "MCH-KAT-CARBON", title: L("Charcoal", "Carbón"), values: { color: L("Charcoal", "Carbón") }, price: 320000, compareAt: 380000, inventory: 0 },
    ],
    categoryIds: ["cat-bags"],
    collectionIds: ["col-raiz", "col-hecha-mano"],
    regionId: "reg-guajira",
    artisanId: "art-amalia",
    featured: true,
    badge: L("-16%", "-16 %"),
    status: "active",
    createdAt: "2026-01-12",
  },
  {
    id: "pr-cafe-altura",
    slug: "cafe-organico-altura-quindio",
    name: L('Organic Coffee "Altura Quindío"', 'Café Orgánico "Altura Quindío"'),
    tagline: L("Single origin · 1.800 m.a.s.l.", "Origen único · 1.800 m.s.n.m."),
    description: L(
      "A honey-processed typica washed in the mountain air of Salento. Notes of panela, orange peel and cacao. Roasted in small batches every Tuesday.",
      "Una typica de proceso honey lavada en el aire de montaña de Salento. Notas de panela, cáscara de naranja y cacao. Tostado en pequeños lotes cada martes.",
    ),
    story: [
      L(
        "Miguel's family farm sits at eighteen hundred metres, where the nights are cold enough to slow the coffee cherry's sugar development — the secret to this cup's sweetness.",
        "La finca de la familia de Miguel está a mil ochocientos metros, donde las noches son frías y el desarrollo de azúcar de la cereza se ralentiza — el secreto de la dulzura de esta taza.",
      ),
      L(
        "The cherries are hand-picked, floated, and dried on raised beds under a guadua roof. What reaches your grinder is a coffee that tastes like a place, not a blend.",
        "Las cerezas se recolectan a mano, se flotan y se secan en camas elevadas bajo un techo de guadua. Lo que llega a tu molino es un café que sabe a un lugar, no a una mezcla.",
      ),
    ],
    details: [
      L("100% arabica typica & bourbon, organic", "100 % arábica typica y bourbon, orgánico"),
      L("Honey process · roasted medium-light", "Proceso honey · tueste medio-claro"),
      L("500 g whole bean, sealed with degassing valve", "500 g en grano, sellado con válvula desgasificadora"),
      L("Roasted weekly in Salento, Quindío", "Tostado semanalmente en Salento, Quindío"),
      L("Best within 8 weeks of roast date", "Mejor dentro de las 8 semanas posteriores al tueste"),
    ],
    images: [
      {
        src: "/images/p-cafe-altura-1.svg",
        alt: L("Bag of organic Quindío coffee", "Bolsa de café orgánico del Quindío"),
        caption: L("The Altura Quindío bag", "La bolsa Altura Quindío"),
      },
      {
        src: "/images/p-cafe-altura-2.svg",
        alt: L("Roasted coffee beans from Quindío", "Granos de café tostados del Quindío"),
        caption: L("Honey-processed beans", "Granos de proceso honey"),
      },
    ],
    price: cop(68000),
    options: [
      { id: "formato", name: L("Format", "Presentación"), values: [L("Whole bean", "Grano"), L("Ground — filter", "Molido filtro"), L("Ground — espresso", "Molido espresso")] },
    ],
    variants: [
      { id: "caf-alt-grano", sku: "CAF-ALT-GRANO", title: L("Whole bean", "Grano"), values: { formato: L("Whole bean", "Grano") }, price: 68000, inventory: 24 },
      { id: "caf-alt-filtro", sku: "CAF-ALT-FILTRO", title: L("Ground — filter", "Molido filtro"), values: { formato: L("Ground — filter", "Molido filtro") }, price: 68000, inventory: 18 },
      { id: "caf-alt-espresso", sku: "CAF-ALT-ESPRESSO", title: L("Ground — espresso", "Molido espresso"), values: { formato: L("Ground — espresso", "Molido espresso") }, price: 68000, inventory: 12 },
    ],
    categoryIds: ["cat-coffee"],
    collectionIds: ["col-cafe"],
    regionId: "reg-eje-cafetero",
    artisanId: "art-miguel",
    featured: true,
    status: "active",
    createdAt: "2026-01-08",
  },
  {
    id: "pr-cafe-sierra",
    slug: "cafe-sierra-nevada",
    name: L('Coffee "Sierra Nevada"', 'Café "Sierra Nevada"'),
    tagline: L("From the ancestral mountain", "De la montaña ancestral"),
    description: L(
      "Grown by four Arhuaco families on the slopes of the Sierra Nevada de Santa Marta, the world's highest coastal mountain. Notes of brown sugar, hazelnut and red apple.",
      "Cultivado por cuatro familias arhuacas en las laderas de la Sierra Nevada de Santa Marta, la montaña costera más alta del mundo. Notas de panela, avellana y manzana roja.",
    ),
    story: [
      L(
        "For the Arhuaco, the Sierra Nevada is the Heart of the World, and coffee is grown as an act of care. This lot is bought directly from the families and roasted gently to preserve its altitude character.",
        "Para los arhuacos, la Sierra Nevada es el Corazón del Mundo, y el café se cultiva como un acto de cuidado. Este lote se compra directamente a las familias y se tuesta suavemente para preservar su carácter de altura.",
      ),
    ],
    details: [
      L("100% arabica · washed process", "100 % arábica · proceso lavado"),
      L("250 g whole bean", "250 g en grano"),
      L("Direct trade with Arhuaco families", "Comercio directo con familias arhuacas"),
      L("Roasted medium in Bogotá", "Tueste medio en Bogotá"),
    ],
    images: [
      {
        src: "/images/p-cafe-sierra-1.svg",
        alt: L("Sierra Nevada coffee bag", "Bolsa de café Sierra Nevada"),
        caption: L("The Sierra Nevada lot", "El lote Sierra Nevada"),
      },
      {
        src: "/images/p-cafe-sierra-2.svg",
        alt: L("Coffee beans of the Sierra Nevada", "Granos de café de la Sierra Nevada"),
        caption: L("Washed beans, medium roast", "Granos lavados, tueste medio"),
      },
    ],
    price: cop(52000),
    compareAtPrice: cop(62000),
    options: [
      { id: "formato", name: L("Format", "Presentación"), values: [L("Whole bean", "Grano"), L("Ground", "Molido")] },
    ],
    variants: [
      { id: "caf-sie-grano", sku: "CAF-SIE-GRANO", title: L("Whole bean", "Grano"), values: { formato: L("Whole bean", "Grano") }, price: 52000, compareAt: 62000, inventory: 15 },
      { id: "caf-sie-molido", sku: "CAF-SIE-MOLIDO", title: L("Ground", "Molido"), values: { formato: L("Ground", "Molido") }, price: 52000, compareAt: 62000, inventory: 9 },
    ],
    categoryIds: ["cat-coffee"],
    collectionIds: ["col-cafe"],
    regionId: "reg-caribe",
    badge: L("-16%", "-16 %"),
    status: "active",
    createdAt: "2026-01-20",
  },
  {
    id: "pr-vasija-raiz",
    slug: "vasija-de-barro-raiz",
    name: L('Clay Vase "Raíz"', 'Vasija de Barro "Raíz"'),
    tagline: L("Hand-thrown in Ráquira", "Moldeada a mano en Ráquira"),
    description: L(
      "A stoneware vase thrown by hand, burnished with river stones and fired in a wood kiln. The Raíz holds flowers or stands alone as a sculpture of earth.",
      "Una vasija de gres moldeada a mano, bruñida con piedras de río y horneada en horno de leña. La Raíz sostiene flores o se sostiene sola como escultura de tierra.",
    ),
    story: [
      L(
        "Lucía throws each Raíz in one continuous motion, reading the clay's moisture the way her father taught her. The burnished surface catches the light like polished stone.",
        "Lucía moldea cada Raíz en un solo movimiento continuo, leyendo la humedad del barro como le enseñó su padre. La superficie bruñida captura la luz como la piedra pulida.",
      ),
      L(
        "Fired for fourteen hours with eucalyptus wood, every vase emerges a slightly different shade of terracotta — the signature of fire that no glaze can copy.",
        "Horneada durante catorce horas con leña de eucalipto, cada vasija sale con un tono de terracota ligeramente distinto — la firma del fuego que ningún esmalte puede copiar.",
      ),
    ],
    details: [
      L("Hand-thrown local clay, wood-fired", "Barro local moldeado a mano, horneado a leña"),
      L("Height 28 cm · mouth 9 cm", "Alto 28 cm · boca 9 cm"),
      L("Suitable for fresh or dry arrangements", "Apta para arreglos frescos o secos"),
      L("Food-safe interior; hand wash", "Interior apto para alimentos; lavar a mano"),
      L("Small variations are the mark of the maker", "Las pequeñas variaciones son la marca del creador"),
    ],
    images: [
      {
        src: "/images/p-vasija-raiz-1.svg",
        alt: L("Hand-thrown clay vase Raíz", "Vasija de barro moldeada a mano Raíz"),
        caption: L("The Raíz in terracotta", "La Raíz en terracota"),
      },
      {
        src: "/images/p-vasija-raiz-2.svg",
        alt: L("Detail of burnished clay surface", "Detalle de la superficie de barro bruñido"),
        caption: L("Burnished, unglazed surface", "Superficie bruñida, sin esmaltar"),
      },
    ],
    price: cop(185000),
    options: [
      { id: "tono", name: L("Tone", "Tono"), values: [L("Terra", "Terra"), L("Ash", "Ceniza")] },
    ],
    variants: [
      { id: "vas-rai-terra", sku: "VAS-RAI-TERRA", title: L("Terra", "Terra"), values: { tono: L("Terra", "Terra") }, price: 185000, inventory: 6 },
      { id: "vas-rai-ceniza", sku: "VAS-RAI-CENIZA", title: L("Ash", "Ceniza"), values: { tono: L("Ash", "Ceniza") }, price: 195000, inventory: 3 },
    ],
    categoryIds: ["cat-ceramics"],
    collectionIds: ["col-raiz"],
    regionId: "reg-boyaca",
    artisanId: "art-lucia",
    featured: true,
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "pr-plato-luna",
    slug: "plato-ceramico-luna-set-de-4",
    name: L('Ceramic Plate "Luna"', 'Plato Cerámico "Luna"'),
    tagline: L("Set of four · Ráquira clay", "Set de cuatro · Barro de Ráquira"),
    description: L(
      "Four dinner plates with a soft, moonlit glaze over raw clay. Stacked on a shelf or laid on a table, they bring the quiet warmth of a Colombian highland kitchen.",
      "Cuatro platos de cena con un esmalte suave, de luz de luna, sobre barro crudo. Apilados en un estante o puestos en la mesa, llevan el calor callado de una cocina de altura colombiana.",
    ),
    story: [
      L(
        "The Luna glaze was developed by Lucía over two years of firings, chasing a surface that feels like morning fog over the páramo.",
        "El esmalte Luna fue desarrollado por Lucía durante dos años de hornadas, persiguiendo una superficie que se sienta como la niebla de la mañana sobre el páramo.",
      ),
    ],
    details: [
      L("Set of 4 · 26 cm each", "Set de 4 · 26 cm cada uno"),
      L("Food-safe, dishwasher-safe glaze", "Esmalte apto para alimentos y lavavajillas"),
      L("Hand-thrown; each plate unique", "Moldeados a mano; cada plato es único"),
    ],
    images: [
      {
        src: "/images/p-plato-luna-1.svg",
        alt: L("Ceramic Luna plates set", "Set de platos de cerámica Luna"),
        caption: L("Set of four", "Set de cuatro"),
      },
      {
        src: "/images/p-plato-luna-2.svg",
        alt: L("Detail of the Luna glaze", "Detalle del esmalte Luna"),
        caption: L("Moonlit glaze detail", "Detalle del esmalte de luna"),
      },
    ],
    price: cop(240000),
    options: [],
    variants: [{ id: "pla-lun-set4", sku: "PLA-LUN-SET4", title: L("Set of 4", "Set de 4"), values: {}, price: 240000, inventory: 5 }],
    categoryIds: ["cat-ceramics"],
    collectionIds: [],
    regionId: "reg-boyaca",
    artisanId: "art-lucia",
    status: "active",
    createdAt: "2026-02-01",
  },
  {
    id: "pr-ruana-paramo",
    slug: "ruana-tejida-paramo",
    name: L('Woven Ruana "Páramo"', 'Ruana Tejida "Páramo"'),
    tagline: L("Woven wool · highland warmth", "Lana tejida · calor de altura"),
    description: L(
      "A traditional ruana woven on a pedal loom from highland wool, finished with hand-knotted fringe. The piece that has warmed Colombian shoulders for three centuries.",
      "Una ruana tradicional tejida en telar de pedal con lana de altura, terminada con fleco anudado a mano. La prenda que ha abrigado hombros colombianos durante tres siglos.",
    ),
    story: [
      L(
        "The ruana was born in the cold of the Andes, where a blanket with a slit for the head became the country's most honest garment. Ours is woven in Boyacá from wool of the same páramo sheep.",
        "La ruana nació en el frío de los Andes, donde una manta con una abertura para la cabeza se volvió la prenda más honesta del país. La nuestra se teje en Boyacá con lana de las mismas ovejas de páramo.",
      ),
      L(
        "One ruana takes a weaver two full days at the loom. The wool is brushed, not felted, so it stays light and breathes with you.",
        "Una ruana toma dos días completos de telar. La lana se cepilla, no se afieltra, para que siga siendo ligera y respire contigo.",
      ),
    ],
    details: [
      L("100% highland sheep wool", "100 % lana de oveja de altura"),
      L("Woven on pedal loom · hand-knotted fringe", "Tejida en telar de pedal · fleco anudado a mano"),
      L("140 × 90 cm + 12 cm fringe", "140 × 90 cm + 12 cm de fleco"),
      L("Dry clean or gentle hand wash, cold", "Limpieza en seco o lavado a mano suave, en frío"),
      L("One size fits most", "Talla única"),
    ],
    images: [
      {
        src: "/images/p-ruana-paramo-1.svg",
        alt: L("Woven wool ruana Páramo", "Ruana de lana tejida Páramo"),
        caption: L("The Páramo ruana", "La ruana Páramo"),
      },
      {
        src: "/images/p-ruana-paramo-2.svg",
        alt: L("Detail of ruana weave and fringe", "Detalle del tejido y el fleco de la ruana"),
        caption: L("Looped weave and fringe", "Tejido de bucle y fleco"),
      },
    ],
    price: cop(420000),
    options: [
      { id: "color", name: L("Color", "Color"), values: [L("Páramo grey", "Gris páramo"), L("Coffee", "Café"), L("Moss green", "Verde musgo")] },
    ],
    variants: [
      { id: "rua-par-gris", sku: "RUA-PAR-GRIS", title: L("Páramo grey", "Gris páramo"), values: { color: L("Páramo grey", "Gris páramo") }, price: 420000, inventory: 4 },
      { id: "rua-par-cafe", sku: "RUA-PAR-CAFE", title: L("Coffee", "Café"), values: { color: L("Coffee", "Café") }, price: 420000, inventory: 3 },
      { id: "rua-par-musgo", sku: "RUA-PAR-MUSGO", title: L("Moss green", "Verde musgo"), values: { color: L("Moss green", "Verde musgo") }, price: 440000, inventory: 2 },
    ],
    categoryIds: ["cat-textiles"],
    collectionIds: ["col-raiz", "col-hecha-mano"],
    regionId: "reg-boyaca",
    featured: true,
    status: "active",
    createdAt: "2026-01-18",
  },
  {
    id: "pr-camino-flores",
    slug: "camino-de-mesa-flores-del-valle",
    name: L('Table Runner "Flores del Valle"', 'Camino de Mesa "Flores del Valle"'),
    tagline: L("Hand-embroidered table runner", "Camino de mesa bordado a mano"),
    description: L(
      "A linen table runner embroidered with the wildflowers of the Cauca valley — a slow, hand-stitched centerpiece for the table that gathers your people.",
      "Un camino de mesa de lino bordado con las flores silvestres del valle del Cauca — una pieza central lenta, cosida a mano, para la mesa que reúne a los tuyos.",
    ),
    story: [
      L(
        "Each flower is stitched by hand over two evenings of work. The women who embroider these runners learned the pattern from a century-old sampler kept in their workshop.",
        "Cada flor se cose a mano en dos tardes de trabajo. Las mujeres que bordan estos caminos aprendieron el patrón de un muestrario centenario guardado en su taller.",
      ),
    ],
    details: [
      L("Linen blend, hand-embroidered", "Mezcla de lino, bordado a mano"),
      L("180 × 40 cm", "180 × 40 cm"),
      L("Machine wash cold, gentle", "Lavar a máquina en frío, ciclo suave"),
    ],
    images: [
      {
        src: "/images/p-camino-flores-1.svg",
        alt: L("Embroidered table runner Flores del Valle", "Camino de mesa bordado Flores del Valle"),
        caption: L("The Flores del Valle runner", "El camino Flores del Valle"),
      },
      {
        src: "/images/p-camino-flores-2.svg",
        alt: L("Detail of hand embroidery", "Detalle del bordado a mano"),
        caption: L("Hand-stitched flowers", "Flores cosidas a mano"),
      },
    ],
    price: cop(210000),
    options: [],
    variants: [{ id: "cam-flo-180", sku: "CAM-FLO-180", title: L("180 × 40 cm", "180 × 40 cm"), values: {}, price: 210000, inventory: 7 }],
    categoryIds: ["cat-textiles", "cat-home"],
    collectionIds: [],
    regionId: "reg-bogota",
    status: "active",
    createdAt: "2026-02-05",
  },
  {
    id: "pr-bolso-monte",
    slug: "bolso-de-cuero-monte",
    name: L('Leather Bag "Monte"', 'Bolso de Cuero "Monte"'),
    tagline: L("Vegetable-tanned · Bogotá atelier", "Curtido al vegetal · Taller de Bogotá"),
    description: L(
      "A structured shoulder bag cut from full-grain, vegetable-tanned leather that deepens in colour with every year of use. Designed in Bogotá, stitched by hand.",
      "Un bolso de hombro estructurado cortado en cuero plena flor curtido al vegetal, que oscurece con cada año de uso. Diseñado en Bogotá, cosido a mano.",
    ),
    story: [
      L(
        "Esteban cuts the Monte from a single hide, choosing the firmest section for the body. The edges are painted and polished by hand — six passes, like his grandfather taught.",
        "Esteban corta el Monte de una sola piel, eligiendo la sección más firme para el cuerpo. Los bordes se pintan y pulen a mano — seis pasadas, como enseñó su abuelo.",
      ),
    ],
    details: [
      L("Full-grain vegetable-tanned leather", "Cuero plena flor curtido al vegetal"),
      L("Hand-painted edges · solid brass hardware", "Bordes pintados a mano · herrajes de latón macizo"),
      L("33 × 25 × 12 cm · strap drop 28 cm", "33 × 25 × 12 cm · caída de correa 28 cm"),
      L('Fits a 13" laptop', "Cabe una laptop de 13\""),
      L("Condition with natural wax twice a year", "Acondicionar con cera natural dos veces al año"),
    ],
    images: [
      {
        src: "/images/p-bolso-monte-1.svg",
        alt: L("Leather shoulder bag Monte", "Bolso de cuero Monte"),
        caption: L("The Monte in tan", "El Monte en tabaco"),
      },
      {
        src: "/images/p-bolso-monte-2.svg",
        alt: L("Detail of leather edge painting", "Detalle del pintado de bordes en cuero"),
        caption: L("Hand-painted edges", "Bordes pintados a mano"),
      },
    ],
    price: cop(360000),
    options: [
      { id: "color", name: L("Color", "Color"), values: [L("Tan", "Tabaco"), L("Black", "Negro"), L("Green", "Verde")] },
    ],
    variants: [
      { id: "bol-mon-tabaco", sku: "BOL-MON-TABACO", title: L("Tan", "Tabaco"), values: { color: L("Tan", "Tabaco") }, price: 360000, inventory: 5 },
      { id: "bol-mon-negro", sku: "BOL-MON-NEGRO", title: L("Black", "Negro"), values: { color: L("Black", "Negro") }, price: 370000, inventory: 3 },
      { id: "bol-mon-verde", sku: "BOL-MON-VERDE", title: L("Green", "Verde"), values: { color: L("Green", "Verde") }, price: 360000, inventory: 0 },
    ],
    categoryIds: ["cat-bags"],
    collectionIds: ["col-hecha-mano"],
    regionId: "reg-bogota",
    artisanId: "art-esteban",
    featured: true,
    status: "active",
    createdAt: "2026-01-25",
  },
  {
    id: "pr-cinturon-sendero",
    slug: "cinturon-de-cuero-sendero",
    name: L('Leather Belt "Sendero"', 'Cinturón de Cuero "Sendero"'),
    tagline: L("Hand-cut · brass buckle", "Cortado a mano · hebilla de latón"),
    description: L(
      "A slim belt cut from the same vegetable-tanned leather as the Monte bag, with a solid brass buckle that will outlive the leather. Made to be passed down.",
      "Un cinturón delgado cortado del mismo cuero curtido al vegetal del bolso Monte, con una hebilla de latón macizo que sobrevivirá al cuero. Hecho para heredarse.",
    ),
    story: [
      L(
        "The Sendero is the piece Esteban gives to friends when their first child is born — a small object that starts its life already old.",
        "El Sendero es la pieza que Esteban regala a los amigos cuando nace su primer hijo — un objeto pequeño que empieza su vida ya viejo.",
      ),
    ],
    details: [
      L("Full-grain leather, 3 cm wide", "Cuero plena flor, 3 cm de ancho"),
      L("Solid brass buckle", "Hebilla de latón macizo"),
      L("Sizes S–XL (80–110 cm)", "Tallas S–XL (80–110 cm)"),
    ],
    images: [
      {
        src: "/images/p-cinturon-monte-1.svg",
        alt: L("Leather belt Sendero", "Cinturón de cuero Sendero"),
        caption: L("The Sendero belt", "El cinturón Sendero"),
      },
      {
        src: "/images/p-cinturon-monte-2.svg",
        alt: L("Brass buckle detail", "Detalle de la hebilla de latón"),
        caption: L("Solid brass buckle", "Hebilla de latón macizo"),
      },
    ],
    price: cop(140000),
    options: [
      { id: "talla", name: L("Size", "Talla"), values: [L("S 80", "S 80"), L("M 90", "M 90"), L("L 100", "L 100"), L("XL 110", "XL 110")] },
    ],
    variants: [
      { id: "cin-sen-s80", sku: "CIN-SEN-S80", title: L("S 80", "S 80"), values: { talla: L("S 80", "S 80") }, price: 140000, inventory: 6 },
      { id: "cin-sen-m90", sku: "CIN-SEN-M90", title: L("M 90", "M 90"), values: { talla: L("M 90", "M 90") }, price: 140000, inventory: 8 },
      { id: "cin-sen-l100", sku: "CIN-SEN-L100", title: L("L 100", "L 100"), values: { talla: L("L 100", "L 100") }, price: 140000, inventory: 5 },
      { id: "cin-sen-xl110", sku: "CIN-SEN-XL110", title: L("XL 110", "XL 110"), values: { talla: L("XL 110", "XL 110") }, price: 140000, inventory: 2 },
    ],
    categoryIds: ["cat-bags"],
    collectionIds: [],
    regionId: "reg-bogota",
    artisanId: "art-esteban",
    status: "active",
    createdAt: "2026-02-10",
  },
  {
    id: "pr-collar-andino",
    slug: "collar-esmeralda-verde-andino",
    name: L('Emerald Collar "Verde Andino"', 'Collar Esmeralda "Verde Andino"'),
    tagline: L("Colombian emerald · recycled silver", "Esmeralda colombiana · Plata reciclada"),
    description: L(
      "A single Colombian emerald set in recycled sterling silver, chosen for its deep green and quiet fire. Suspended on a fine curb chain.",
      "Una esmeralda colombiana engastada en plata de ley reciclada, elegida por su verde profundo y su fuego callado. Suspendida de una cadena fina.",
    ),
    story: [
      L(
        "Yamile selects each stone for colour before carat — the green of the cordillera, she says, is a shade you recognise in your chest. The collar is set in her Bogotá workshop.",
        "Yamile elige cada piedra por su color antes que por su peso — el verde de la cordillera, dice, es un tono que se reconoce en el pecho. El collar se engasta en su taller de Bogotá.",
      ),
    ],
    details: [
      L("Natural Colombian emerald, approx. 0.8 ct", "Esmeralda colombiana natural, aprox. 0.8 ct"),
      L("Recycled 925 sterling silver", "Plata de ley 925 reciclada"),
      L("Chain length 42 cm, adjustable to 45", "Cadena de 42 cm, ajustable a 45"),
      L("Gemstone certificate included", "Incluye certificado de la gema"),
      L("Keep away from perfume and chlorine", "Mantener alejado de perfume y cloro"),
    ],
    images: [
      {
        src: "/images/p-collar-andino-1.svg",
        alt: L("Emerald pendant collar Verde Andino", "Collar con dije de esmeralda Verde Andino"),
        caption: L("The Verde Andino collar", "El collar Verde Andino"),
      },
      {
        src: "/images/p-collar-andino-2.svg",
        alt: L("Detail of emerald setting", "Detalle del engaste de la esmeralda"),
        caption: L("Hand-set emerald", "Esmeralda engastada a mano"),
      },
    ],
    price: cop(890000),
    compareAtPrice: cop(990000),
    options: [],
    variants: [{ id: "col-and-42", sku: "COL-AND-42", title: L("42 cm", "42 cm"), values: {}, price: 890000, compareAt: 990000, inventory: 3 }],
    categoryIds: ["cat-jewelry"],
    collectionIds: ["col-raiz"],
    regionId: "reg-bogota",
    artisanId: "art-yamile",
    badge: L("-10%", "-10 %"),
    status: "active",
    createdAt: "2026-02-08",
  },
  {
    id: "pr-canasto-norte",
    slug: "canasto-norte",
    name: L('Basket "Norte"', 'Canasto "Norte"'),
    tagline: L("Sea-grass basket · Caribe", "Canasto de hierba marina · Caribe"),
    description: L(
      "A generous basket woven from coastal sea grass and fique, born in the basket villages of Bolívar. For bread, fruit, or the things you want within reach.",
      "Un canasto generoso tejido en hierba marina costera y fique, nacido en los pueblos cesteros de Bolívar. Para el pan, la fruta, o las cosas que quieres a la mano.",
    ),
    story: [
      L(
        "The weavers of the coast coil each canasto around a palm-fibre core, packing the grass tight so it holds its shape for decades.",
        "Las tejedoras de la costa enrollan cada canasto alrededor de un núcleo de fibra de palma, apretando la hierba para que conserve su forma durante décadas.",
      ),
    ],
    details: [
      L("Sea grass & fique, hand-coiled", "Hierba marina y fique, enrollado a mano"),
      L("Diameter 34 cm · height 22 cm", "Diámetro 34 cm · alto 22 cm"),
      L("Wipe with a damp cloth", "Limpiar con un paño húmedo"),
    ],
    images: [
      {
        src: "/images/p-canasto-norte-1.svg",
        alt: L("Sea-grass basket Norte", "Canasto de hierba marina Norte"),
        caption: L("The Norte canasto", "El canasto Norte"),
      },
      {
        src: "/images/p-canasto-norte-2.svg",
        alt: L("Detail of coiled weaving", "Detalle del tejido enrollado"),
        caption: L("Hand-coiled weave", "Tejido enrollado a mano"),
      },
    ],
    price: cop(130000),
    options: [],
    variants: [{ id: "can-nor-34", sku: "CAN-NOR-34", title: L("34 cm", "34 cm"), values: {}, price: 130000, inventory: 9 }],
    categoryIds: ["cat-home"],
    collectionIds: [],
    regionId: "reg-caribe",
    status: "active",
    createdAt: "2026-02-12",
  },
  {
    id: "pr-hamaca-brisa",
    slug: "hamaca-brisa",
    name: L('Hammock "Brisa"', 'Hamaca "Brisa"'),
    tagline: L("Woven for rest · Caribe", "Tejida para el descanso · Caribe"),
    description: L(
      "A double hammock woven in the coastal tradition — open weave that breathes, fringes that sway, and a rest that only the Caribbean knows how to make.",
      "Una hamaca doble tejida en la tradición costera — tejido abierto que respira, flecos que se mecen, y un descanso que solo el Caribe sabe hacer.",
    ),
    story: [
      L(
        "The hamaca is Colombia's oldest piece of furniture and its best teacher of patience. Ours is woven on a frame of caracolí wood, the yarn doubled for strength.",
        "La hamaca es el mueble más antiguo de Colombia y su mejor maestro de paciencia. La nuestra se teje en un bastidor de madera de caracolí, con el hilo doblado para darle fuerza.",
      ),
    ],
    details: [
      L("100% cotton, hand-woven", "100 % algodón, tejida a mano"),
      L("Opens to 340 × 150 cm", "Abre a 340 × 150 cm"),
      L("Holds up to 180 kg", "Soporta hasta 180 kg"),
      L("Machine wash cold, gentle; dry flat", "Lavar a máquina en frío, ciclo suave; secar extendida"),
    ],
    images: [
      {
        src: "/images/p-hamaca-brisa-1.svg",
        alt: L("Cotton hammock Brisa", "Hamaca de algodón Brisa"),
        caption: L("The Brisa, open weave", "La Brisa, tejido abierto"),
      },
      {
        src: "/images/p-hamaca-brisa-2.svg",
        alt: L("Detail of hammock fringe", "Detalle del fleco de la hamaca"),
        caption: L("Hand-knotted fringe", "Fleco anudado a mano"),
      },
    ],
    price: cop(520000),
    options: [
      { id: "color", name: L("Color", "Color"), values: [L("Natural", "Natural"), L("Indigo", "Índigo"), L("Sun", "Sol")] },
    ],
    variants: [
      { id: "ham-bri-natural", sku: "HAM-BRI-NATURAL", title: L("Natural", "Natural"), values: { color: L("Natural", "Natural") }, price: 520000, inventory: 4 },
      { id: "ham-bri-indigo", sku: "HAM-BRI-INDIGO", title: L("Indigo", "Índigo"), values: { color: L("Indigo", "Índigo") }, price: 560000, inventory: 2 },
      { id: "ham-bri-sol", sku: "HAM-BRI-SOL", title: L("Sun", "Sol"), values: { color: L("Sun", "Sol") }, price: 540000, inventory: 3 },
    ],
    categoryIds: ["cat-home", "cat-textiles"],
    collectionIds: [],
    regionId: "reg-caribe",
    status: "active",
    createdAt: "2026-02-14",
  },
];

/** Resolve bilingual seeds to a plain product for one locale. */
export function resolveProducts(seeds: ProductSeed[], locale: Locale): Product[] {
  return seeds.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: pick(p.name, locale),
    tagline: pick(p.tagline, locale),
    description: pick(p.description, locale),
    story: p.story.map((s) => pick(s, locale)),
    details: p.details.map((d) => pick(d, locale)),
    images: p.images.map((img) => pickImage(img, locale)),
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    options: p.options.map((o) => ({
      id: o.id,
      name: pick(o.name, locale),
      values: o.values.map((v) => pick(v, locale)),
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: pick(v.title, locale),
      optionValues: Object.fromEntries(
        Object.entries(v.values).map(([key, value]) => [key, pick(value, locale)]),
      ),
      price: cop(v.price),
      compareAtPrice: v.compareAt ? cop(v.compareAt) : undefined,
      inventory: v.inventory,
      imageSrc: v.imageSrc,
    })),
    categoryIds: p.categoryIds,
    collectionIds: p.collectionIds,
    regionId: p.regionId,
    artisanId: p.artisanId,
    featured: p.featured,
    badge: p.badge ? pick(p.badge, locale) : undefined,
    status: p.status,
    createdAt: p.createdAt,
  }));
}

export const resolveProduct = (seed: ProductSeed, locale: Locale) => resolveProducts([seed], locale)[0];

export const getProducts = (locale: Locale) => resolveProducts(productSeeds, locale);
export const getProductById = (locale: Locale, id: string) => resolveProducts(productSeeds, locale).find((p) => p.id === id);
export const getProductBySlug = (locale: Locale, slug: string) => resolveProducts(productSeeds, locale).find((p) => p.slug === slug);
export const getProductsByCategory = (locale: Locale, categoryId: string) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active" && p.categoryIds.includes(categoryId));
export const getProductsByCollection = (locale: Locale, collectionId: string) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active" && p.collectionIds.includes(collectionId));
export const getProductsByRegion = (locale: Locale, regionId: string) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active" && p.regionId === regionId);
export const getProductsByArtisan = (locale: Locale, artisanId: string) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active" && p.artisanId === artisanId);
export const getFeaturedProducts = (locale: Locale) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active" && p.featured);
export const getActiveProducts = (locale: Locale) =>
  resolveProducts(productSeeds, locale).filter((p) => p.status === "active");

/** Seed-level lookups used by the Admin panel and client state. */
export const getProductSeedById = (id: string) => productSeeds.find((p) => p.id === id);
export const getProductSeedBySlug = (slug: string) => productSeeds.find((p) => p.slug === slug);

/**
 * Locale-independent lookups (prices, slugs, inventory) used by client state
 * such as the cart — data shared by both languages.
 */
export const getProductSlugs = () => productSeeds.map((p) => p.slug);
export const getVariantById = (variantId: string) => {
  for (const p of productSeeds) {
    const variant = p.variants.find((v) => v.id === variantId);
    if (variant) return { productId: p.id, variant };
  }
  return undefined;
};
