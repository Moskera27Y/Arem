import type { Story } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

interface StorySeed {
  id: string;
  slug: string;
  title: Localized;
  dek: Localized;
  body: Localized[];
  image: LocalizedImage;
  category: Localized;
  regionId?: string;
  artisanId?: string;
  date: string;
  readTime: Localized;
  featured?: boolean;
}

/**
 * Editorial stories — bilingual. Admin-managed per locale in a later phase.
 */
const seed: StorySeed[] = [
  {
    id: "st-tejer",
    slug: "tejer-el-desierto",
    title: L(
      "Weaving the desert: the Wayuu mochila and its meanings",
      "Tejer el desierto: la mochila wayuu y sus significados",
    ),
    dek: L(
      "A spiral of cotton that never ends — that is how they weave, and how they think, in La Guajira.",
      "Una espiral de algodón que no termina nunca — así se teje, y así se piensa, en La Guajira.",
    ),
    body: [
      L(
        "In the Guajira peninsula, where the land is arid and the sun relentless, Wayuu women weave with a patience that seems to contradict the landscape. The mochila is their essential object: bag, companion, memory.",
        "En la península de La Guajira, donde la tierra es árida y el sol implacable, las mujeres wayuu tejen con una paciencia que parece desmentir el paisaje. La mochila es su objeto esencial: bolso, compañera, memoria.",
      ),
      L(
        "The technique is called kanas and it is worked in a continuous spiral, with no apparent beginning or end. Each mochila can take three weeks of work in the hands of a weaver who, as she weaves, talks, minds her children and thinks.",
        "La técnica se llama kanas y se ejecuta en una espiral continua, sin inicio ni fin aparentes. Cada mochila puede tomar tres semanas de trabajo entre las manos de una tejedora que, mientras teje, conversa, cuida a sus hijos y piensa.",
      ),
      L(
        "The patterns are not decoration: they are language. Stars, mountains, the path of the ants, the symbols the grandmother passed to the mother and the mother to the daughter, in an unbroken line of knowledge.",
        "Los patrones no son decoración: son lenguaje. Estrellas, montañas, el camino de las hormigas, los símbolos que la abuela transmitió a la madre y la madre a la hija, en una línea ininterrumpida de conocimiento.",
      ),
      L(
        "When you carry a Wayuu mochila you are not carrying an accessory. You are carrying a woman's time, her lineage and an entire worldview.",
        "Cuando llevas una mochila wayuu no llevas un accesorio. Llevas el tiempo de una mujer, su linaje y una cosmovisión entera.",
      ),
    ],
    image: { src: "/images/s-tejer.svg", alt: L("Wayuu weaving on the desert floor", "Tejido wayuu en el suelo del desierto") },
    category: L("Craft", "Oficio"),
    regionId: "reg-guajira",
    artisanId: "art-amalia",
    date: "2026-01-22",
    readTime: L("6 min read", "6 min"),
    featured: true,
  },
  {
    id: "st-cafe",
    slug: "del-grano-a-la-taza",
    title: L(
      "From bean to cup: the journey of Quindío coffee",
      "Del grano a la taza: el viaje del café quindiano",
    ),
    dek: L(
      "How a family from Salento turned a mountain farm into one of the country's best cups.",
      "Cómo una familia de Salento convirtió una finca de montaña en una de las mejores tazas del país.",
    ),
    body: [
      L(
        "At eighteen hundred metres, the nights of Quindío are cold and the coffee trees rest. That slowness is what gives Miguel Cárdenas' coffee its sweetness: the sugar develops little by little, like character.",
        "A mil ochocientos metros de altura, las noches del Quindío son frías y las matas de café descansan. Esa lentitud es la que da al café de Miguel Cárdenas su dulzura: el azúcar se desarrolla poco a poco, como el carácter.",
      ),
      L(
        "Picking is manual, cherry by cherry. Then comes the honey process, in which the pulp is left to dry on the fruit, and then drying on raised beds under a guadua roof.",
        "La recolección es manual, cereza por cereza. Después viene el proceso honey, en el que la pulpa se deja secar sobre el fruto, y luego el secado en camas elevadas bajo un techo de guadua.",
      ),
      L(
        "Roasting is the third harvest. Miguel roasts in small batches every Tuesday, and what is not sold that week is never sold. That is why the coffee reaches your kitchen with weeks, not months, of life.",
        "Tostar es la tercera cosecha. Miguel tuesta en lotes pequeños cada martes, y lo que no se vende esa semana no se vende nunca. Por eso el café llega a tu cocina con semanas, no meses, de vida.",
      ),
      L(
        "It is, literally, a piece of mountain in a bag — and when you taste it, you know it.",
        "Es, literalmente, un pedazo de montaña envasado — y cuando lo pruebas, lo sabes.",
      ),
    ],
    image: { src: "/images/s-cafe.svg", alt: L("Coffee drying on raised beds in Salento", "Café secándose en camas elevadas en Salento") },
    category: L("Origin", "Origen"),
    regionId: "reg-eje-cafetero",
    artisanId: "art-miguel",
    date: "2026-01-15",
    readTime: L("5 min read", "5 min"),
    featured: true,
  },
  {
    id: "st-barro",
    slug: "el-barro-de-raquira",
    title: L(
      "The clay of Ráquira: a tradition that will not go out",
      "El barro de Ráquira: una tradición que no se apaga",
    ),
    dek: L(
      "In the town of the kilns, clay is still the craft that holds the community together.",
      "En el pueblo de los hornos, la arcilla sigue siendo el oficio que sostiene a la comunidad.",
    ),
    body: [
      L(
        "Ráquira, in Boyacá, is a town painted in colours where clay is both a material and an identity. Since colonial times, its potteries have fed generation after generation.",
        "Ráquira, en Boyacá, es un pueblo pintado de colores donde el barro es materia de trabajo y de identidad. Desde la época colonial, sus alfares alimentan a generaciones enteras.",
      ),
      L(
        "Lucía Vásquez inherited her father's workshop, who inherited it from his. The 1987 wood-fired kiln is still lit every month, and the pieces that come out of it carry the character of fire: none is like another.",
        "Lucía Vásquez heredó el taller de su padre, que lo heredó del suyo. El horno de leña de 1987 sigue encendido cada mes, y las piezas que salen de él cargan el carácter del fuego: ninguna es igual a otra.",
      ),
      L(
        "The pottery of Ráquira survived industry, plastics and fashions. Today, thanks to a market that once again values handmade work, the town's workshops employ more people than twenty years ago.",
        "La cerámica de Ráquira resistió la industria, los plásticos y las modas. Hoy, gracias a un mercado que vuelve a valorar lo hecho a mano, los talleres del pueblo emplean a más personas que hace veinte años.",
      ),
      L(
        "Every vase that reaches a new home is proof that a tradition can, besides surviving, thrive.",
        "Cada vasija que llega a una casa nueva es la prueba de que una tradición puede, además de sobrevivir, prosperar.",
      ),
    ],
    image: { src: "/images/s-barro.svg", alt: L("Clay pots drying at a Ráquira workshop", "Vasijas de barro secándose en un taller de Ráquira") },
    category: L("Craft", "Oficio"),
    regionId: "reg-boyaca",
    artisanId: "art-lucia",
    date: "2026-02-03",
    readTime: L("5 min read", "5 min"),
    featured: true,
  },
  {
    id: "st-esmeralda",
    slug: "la-esmeralda-piedra-de-la-cordillera",
    title: L(
      "The emerald, stone of the cordillera",
      "La esmeralda, piedra de la cordillera",
    ),
    dek: L(
      "The deep green that comes out of the Colombian mountains, and its path to a piece of jewellery.",
      "El verde profundo que sale de las montañas colombianas y su camino hasta una joya.",
    ),
    body: [
      L(
        "Colombia produces the world's most prized emeralds, and their green resembles no other: it is the green of the cordillera after the rain.",
        "Colombia produce las esmeraldas más apreciadas del mundo, y su verde no se parece a ningún otro: es el verde de la cordillera después de la lluvia.",
      ),
      L(
        "The mines of Chivor and Muzo have fed the country's economy and imagination for centuries. But the emerald is not only stone: it is craft, risk and patience.",
        "La mina de Chivor y la de Muzo han alimentado la economía y la imaginación del país durante siglos. Pero la esmeralda no es solo piedra: es oficio, riesgo y paciencia.",
      ),
      L(
        "Yamile Cuesta selects each gem by its colour before its weight. 'A well-set emerald is a small piece of the cordillera', she says, and proves it with every collar that leaves her workbench.",
        "Yamile Cuesta selecciona cada gema por su color antes que por su peso. 'Una esmeralda bien puesta es un pedacito de cordillera', dice, y lo demuestra en cada collar que sale de su banco de trabajo.",
      ),
      L(
        "Wearing a Colombian emerald is wearing an entire landscape around your neck.",
        "Llevar una esmeralda colombiana es llevar un paisaje entero en el cuello.",
      ),
    ],
    image: { src: "/images/s-esmeralda.svg", alt: L("Colombian emerald in a goldsmith's hands", "Esmeralda colombiana en manos de una orfebre") },
    category: L("Origin", "Origen"),
    regionId: "reg-bogota",
    artisanId: "art-yamile",
    date: "2026-02-12",
    readTime: L("4 min read", "4 min"),
    featured: false,
  },
  {
    id: "st-hamaca",
    slug: "hamacas-del-caribe",
    title: L(
      "The Caribbean hammock: the siesta as art",
      "La hamaca caribeña: la siesta como arte",
    ),
    dek: L(
      "Colombia's oldest piece of furniture and the world's best school of patience.",
      "El mueble más antiguo de Colombia y la mejor escuela de paciencia del mundo.",
    ),
    body: [
      L(
        "Before the chair, before the bed, in the Colombian Caribbean there was the hammock. Woven in cotton or fique, hung from two caracolí trunks, it is cradle, sofa and altar of the siesta at once.",
        "Antes de la silla, antes de la cama, en el Caribe colombiano estuvo la hamaca. Tejida en algodón o fique, colgada de dos troncos de caracolí, es a la vez cuna, sofá y altar de la siesta.",
      ),
      L(
        "Weaving a hammock is a craft learned as a child and perfected for life. The open weave lets the breeze through, and the fringe is knotted by hand, a thousand knots per piece.",
        "Tejer una hamaca es un oficio que se aprende de niño y se perfecciona toda la vida. El tejido abierto deja pasar la brisa, y el fleco se anuda a mano, mil nudos por pieza.",
      ),
      L(
        "In coastal towns the hammock is still the first purchase of a new home. It is the object that welcomes the visitor and rocks the newborn.",
        "En los pueblos costeros la hamaca sigue siendo la primera compra de una casa nueva. Es el objeto que recibe al visitante y que arrulla al recién nacido.",
      ),
      L(
        "Perhaps that is why no piece of furniture teaches better the lesson the country wants to remember: hurry is the enemy of good rest.",
        "Quizá por eso ningún mueble enseña mejor la lección que el país quiere recordar: la prisa es el enemigo del buen descanso.",
      ),
    ],
    image: { src: "/images/s-hamaca.svg", alt: L("Hammock swaying between two trees by the sea", "Hamaca meciéndose entre dos árboles junto al mar") },
    category: L("Craft", "Oficio"),
    regionId: "reg-caribe",
    date: "2026-02-18",
    readTime: L("5 min read", "5 min"),
    featured: false,
  },
  {
    id: "st-guadua",
    slug: "guadua-y-arquitectura-del-eje",
    title: L(
      "Guadua and the architecture of the Eje Cafetero",
      "Guadua y arquitectura del Eje Cafetero",
    ),
    dek: L(
      "The giant cane that built the houses of Quindío is once again the material of the future.",
      "La caña gigante que construyó las casas del Quindío vuelve a ser el material del futuro.",
    ),
    body: [
      L(
        "Guadua, a native cane that grows up to thirty metres, was the steel of the builders of the Eje Cafetero. The houses, bridges and workshops of the region were raised with it.",
        "La guadua, una caña nativa que crece hasta treinta metros, fue el acero de los constructores del Eje Cafetero. Las casas, los puentes y los talleres de la región se levantaron con ella.",
      ),
      L(
        "It is an extraordinary material: flexible before tremors, light, and able to grow up to ten centimetres a day. Coffee farms planted it as a living fence and ended up with a forest of structure.",
        "Es un material extraordinario: flexible ante los temblores, ligero, y capaz de crecer hasta diez centímetros por día. Las fincas cafeteras la sembraron como cerca viva y terminaron con un bosque de estructura.",
      ),
      L(
        "Today architects from all over the world travel to Armenia and Salento to study bahareque — the technique of guadua and clay — as a model of sustainable construction.",
        "Hoy arquitectos de todo el mundo viajan a Armenia y Salento a estudiar la bahareque — la técnica de guadua y barro — como modelo de construcción sostenible.",
      ),
      L(
        "Tradition is not repeated: it is reinterpreted. And guadua, like coffee, remains Colombian.",
        "La tradición no se repite: se reinterpreta. Y la guadua, como el café, sigue siendo colombiana.",
      ),
    ],
    image: { src: "/images/s-guadua.svg", alt: L("Guadua cane architecture in the coffee axis", "Arquitectura de guadua en el eje cafetero") },
    category: L("Culture", "Cultura"),
    regionId: "reg-eje-cafetero",
    date: "2026-02-20",
    readTime: L("6 min read", "6 min"),
    featured: false,
  },
];

export const storySeeds = seed;

const resolve = (locale: Locale): Story[] =>
  seed.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: pick(s.title, locale),
    dek: pick(s.dek, locale),
    body: s.body.map((b) => pick(b, locale)),
    image: pickImage(s.image, locale),
    category: pick(s.category, locale),
    regionId: s.regionId,
    artisanId: s.artisanId,
    date: s.date,
    readTime: pick(s.readTime, locale),
    featured: s.featured,
  }));

export const getStories = (locale: Locale) => resolve(locale);
export const getStoryBySlug = (locale: Locale, slug: string) => resolve(locale).find((s) => s.slug === slug);
export const getFeaturedStories = (locale: Locale) => resolve(locale).filter((s) => s.featured);
export const getStorySlugs = () => seed.map((s) => s.slug);
