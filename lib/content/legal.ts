/**
 * AREM WORLD — Legal content (bilingual EN/ES).
 *
 * These are the source-of-truth strings rendered on the legal pages.
 * All claims here are verifiable: Colombian jurisdiction, D.A.N.A./Efecty payment
 * methods, 30-day return window, handmade goods. No statement that cannot be
 * backed is included.
 */
import type { Locale } from "@/lib/i18n/config";

export interface LegalSection {
  title: string;
  body: string | string[];
}

export interface LegalContent {
  privacy: LegalSection[];
  terms: LegalSection[];
  cookies: LegalSection[];
  refunds: LegalSection[];
  lastUpdated: string;
}

const legalContent: Record<Locale, LegalContent> = {
  en: {
    lastUpdated: "2026-09-21",
    privacy: [
      {
        title: "1. Information we collect",
        body: [
          "We collect only the minimum data needed to fulfill your order and communicate with you:",
          "• Account data: name, email, shipping address, phone number (entered at checkout).",
          "• Order data: purchase history, selected variants, payment intent ID (Square).",
          "• Usage data: page views, clicks, and device information collected anonymously via Vercel Analytics. We do not use cookies that identify you without consent.",
          "We never collect biometric data, precise geolocation, or social media profiles.",
        ],
      },
      {
        title: "2. How we use your data",
        body: [
          "Your data is used solely to: (a) process and ship your order, (b) send you order updates and customer service replies, (c) prevent fraud and comply with tax/regulatory obligations.",
          "We do not profile, target-advertise, or sell your data to third parties. No behavioral advertising is used on this site.",
        ],
      },
      {
        title: "3. Data sharing & storage",
        body: [
          "We share data only with: (a) Square (payment processor — payment card data is handled by Square, never touches our servers), (b) our shipping carrier for delivery, (c) our email provider (Resend) for transactional emails.",
          "All databases are hosted on Neon (AWS, USA) with encrypted connections. Session tokens are HMAC-signed and stored as HttpOnly, Secure, SameSite=Strict cookies with a 30-day expiry.",
        ],
      },
      {
        title: "4. Your rights",
        body: [
          "You may request a copy of your data, corrections, or deletion at any time by emailing hola@arem.world. We will respond within 30 days.",
          "You have the right to withdraw consent for marketing communications. Transactional emails (order confirmations, shipping updates) cannot be opted out of while an order is active.",
        ],
      },
      {
        title: "5. Data retention",
        body: [
          "Order and accounting records are retained for 5 years to comply with Colombian tax law (DIAN). Usage analytics are aggregated and retained for no more than 12 months.",
        ],
      },
      {
        title: "6. International transfers",
        body: [
          "Data may be transferred to and processed in the United States (where our servers and processors are located). We rely on adequacy mechanisms under the GDPR and Colombian habeas data law for such transfers.",
        ],
      },
      {
        title: "7. Contact",
        body:
          "Data controller: AREM WORLD, Bogotá, Colombia. For privacy questions, email hola@arem.world.",
      },
    ],
    terms: [
      {
        title: "1. Acceptance",
        body:
          "By accessing arem.world you accept these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use the site.",
      },
      {
        title: "2. Products",
        body: [
          "All items are handmade in Colombia. Each piece is unique; minor variations in color, texture, and dimensions are expected and part of the craft, not defects.",
          "Prices are listed in USD. The final charge to your card may differ based on your bank's exchange rate at the time of processing.",
        ],
      },
      {
        title: "3. Orders",
        body:
          "We reserve the right to refuse or cancel any order at our discretion, particularly if a product is mispriced, out of stock, or if we suspect fraud. You will be notified via email if an order is cancelled.",
      },
      {
        title: "4. Payment",
        body:
          "We accept payment via Square (credit/debit card, Apple Pay, Google Pay) and Colombian cash/banking methods (Efecty, D.A.N.A., Daviplata, Nequi). All payments are processed securely by Square or the respective provider. Card details are never stored on our servers.",
      },
      {
        title: "5. Shipping & delivery",
        body: [
          "We ship worldwide from Bogotá, Colombia with tracking. Estimated delivery times are provided at checkout but are not guaranteed — delays may occur due to customs, weather, or carrier issues.",
          "Import duties, VAT, and customs fees are the responsibility of the buyer and are not included in the product price.",
        ],
      },
      {
        title: "6. Returns & refunds",
        body:
          "You have 30 days from delivery to request a return. Items must be unused, in original packaging, and in the same condition received. See our Refund Policy for full details. Custom or made-to-order items are exempt.",
      },
      {
        title: "7. Intellectual property",
        body:
          "All content on this site — logos, photography, text, designs — is the property of AREM WORLD or its licensors unless otherwise stated. You may not reproduce, distribute, or modify content without prior written permission. The AR❀EM logo and related marks are trademarks of AREM WORLD.",
      },
      {
        title: "8. Limitation of liability",
        body:
          "To the fullest extent permitted by law, our liability for any claim arising from the use of this site or purchase of products is limited to the amount paid for the product. We are not liable for indirect, incidental, or consequential damages.",
      },
      {
        title: "9. Governing law",
        body:
          "These Terms are governed by the laws of Colombia. Any dispute shall be submitted to the competent courts of Bogotá, Colombia, with express waiver of any other jurisdiction.",
      },
      {
        title: "10. Changes to these terms",
        body:
          "We may update these Terms periodically. Changes are effective upon posting. Your continued use of the site after changes constitutes acceptance.",
      },
    ],
    cookies: [
      {
        title: "1. What are cookies?",
        body:
          "Cookies are small text files stored on your device when you visit a website. We use them to make the site work correctly and to understand how visitors use it.",
      },
      {
        title: "2. Cookies we use",
        body: [
          "Essential (always active): cookies needed for the site to function — language preference, cart contents, session management. These cannot be disabled.",
          "Analytics (optional): we use Vercel Analytics to collect anonymized usage data. No personal identifiers are stored. This helps us improve performance and user experience.",
          "No advertising cookies: we do not use third-party advertising cookies, retargeting pixels, or social media tracking scripts.",
        ],
      },
      {
        title: "3. Consent",
        body:
          "On your first visit, a banner asks you to accept or reject non-essential cookies. Essential cookies are used regardless of your choice. You can change your preference at any time via the link in the footer.",
      },
      {
        title: "4. Third-party services",
        body: [
          "Our page may contain links to Instagram. We are not responsible for the privacy practices of external sites.",
          "Square (payment processor) and Resend (email provider) may set their own cookies on their domains — see their respective policies.",
        ],
      },
      {
        title: "5. Managing cookies",
        body:
          "You can disable cookies in your browser settings, but this may break essential site functionality (e.g., the shopping cart).",
      },
    ],
    refunds: [
      {
        title: "1. Our promise",
        body:
          "We craft every piece with care. If you're not completely satisfied, we offer a 30-day return window from the day you receive your order.",
      },
      {
        title: "2. Eligibility",
        body: [
          "Items must be unused, unworn, in original condition with all tags and packaging intact.",
          "Custom, personalized, or made-to-order items are not eligible for returns or exchanges.",
          "Sale or discounted items are final and cannot be returned unless defective.",
          "Earrings are not returnable for hygiene reasons unless defective.",
        ],
      },
      {
        title: "3. How to start a return",
        body: [
          "Email hola@arem.world within 30 days of delivery with your order number and reason for return.",
          "We will reply within 2 business days with return instructions and a prepaid label where applicable.",
          "Do not send the item back without prior authorization — returns without confirmation will be refused.",
        ],
      },
      {
        title: "4. Refund process",
        body: [
          "Once we receive and inspect the returned item, we will notify you of the refund approval within 5 business days.",
          "If approved, the refund is processed to the original payment method. Processing time depends on your bank or provider (typically 3–10 business days).",
          "Shipping costs are non-refundable except in cases of defective or wrong items shipped.",
        ],
      },
      {
        title: "5. Exchanges",
        body:
          "We do not offer exchanges. To get a different item, return your original product and place a new order.",
      },
      {
        title: "6. Defective items",
        body:
          "If your item arrives damaged or defective, contact us within 7 days of delivery with photos. We will send a replacement or issue a full refund, including shipping.",
      },
    ],
  },
  es: {
    lastUpdated: "2026-09-21",
    privacy: [
      {
        title: "1. Información que recopilamos",
        body: [
          "Recopilamos únicamente los datos mínimos necesarios para procesar tu pedido y comunicarnos contigo:",
          "• Datos de cuenta: nombre, correo, dirección de envío, teléfono (ingresados al hacer el pedido).",
          "• Datos de pedido: historial de compras, variantes seleccionadas, ID de intención de pago (Square).",
          "• Datos de uso: vistas de página, clics e información del dispositivo, recolectados de forma anónima por Vercel Analytics. No usamos cookies que te identifiquen sin tu consentimiento.",
          "Nunca recopilamos datos biométricos, geolocalización precisa, ni perfiles de redes sociales.",
        ],
      },
      {
        title: "2. Cómo usamos tus datos",
        body: [
          "Tus datos se usan únicamente para: (a) procesar y enviar tu pedido, (b) enviarte actualizaciones del pedido y respuestas de servicio al cliente, (c) prevenir fraude y cumplir obligaciones fiscales/regulatorias.",
          "No perfilamos, no hacemos publicidad segmentada ni vendemos tus datos a terceros. No hay publicidad conductual en este sitio.",
        ],
      },
      {
        title: "3. Compartición y almacenamiento",
        body: [
          "Compartimos datos solo con: (a) Square (procesador de pagos — los datos de tu tarjeta los maneja Square, nunca tocan nuestros servidores), (b) el transportador para la entrega, (c) nuestro proveedor de email (Resend) para emails transaccionales.",
          "Todas las bases de datos están en Neon (AWS, EE. UU.) con conexiones encriptadas. Las sesiones son tokens HMAC firmadas, almacenadas como cookies HttpOnly, Secure, SameSite=Strict con vencimiento de 30 días.",
        ],
      },
      {
        title: "4. Tus derechos",
        body: [
          "Puedes solicitar una copia de tus datos, correcciones o eliminación en cualquier momento escribiendo a hola@arem.world. Responderemos en 30 días.",
          "Tienes derecho a retirar el consentimiento para comunicaciones de marketing. Los emails transaccionales (confirmaciones de pedido, actualizaciones de envío) no pueden desactivarse mientras un pedido esté activo.",
        ],
      },
      {
        title: "5. Retención de datos",
        body: [
          "Los registros de pedidos y contabilía se conservan por 5 años para cumplir con la legislación fiscal colombiana (DIAN). Los datos de uso se agregan y se conservan por no más de 12 meses.",
        ],
      },
      {
        title: "6. Transferencias internacionales",
        body: [
          "Los datos pueden transferirse y procesarse en Estados Unidos (donde están nuestros servidores y proveedores). Nos basamos en mecanismos de adecuación bajo el GDPR y la ley colombiana de habeas data para dichas transferencias.",
        ],
      },
      {
        title: "7. Contacto",
        body:
          "Responsable de datos: AREM WORLD, Bogotá, Colombia. Para preguntas de privacidad, escribe a hola@arem.world.",
      },
    ],
    terms: [
      {
        title: "1. Aceptación",
        body:
          "Al acceder a arem.world aceptas estos Términos y Condiciones y nuestra Política de Privacidad. Si no estás de acuerdo, no uses el sitio.",
      },
      {
        title: "2. Productos",
        body: [
          "Todos los artículos son hechos a mano en Colombia. Cada pieza es única; las variaciones menores en color, textura y dimensiones son parte del oficio, no defectos.",
          "Los precios se muestran en USD. El cargo final a tu tarjeta puede variar según la tasa de cambio de tu banco al momento de procesar.",
        ],
      },
      {
        title: "3. Pedidos",
        body:
          "Nos reservamos el derecho de rechazar o cancelar cualquier pedido a nuestra discreción, especialmente si un producto está mal pujado, agotado, o si sospechamos fraude. Te notificaremos por email si un pedido es cancelado.",
      },
      {
        title: "4. Pago",
        body:
          "Aceptamos pago vía Square (tarjeta de crédito/débito, Apple Pay, Google Pay) y métodos de efectivo/banca en Colombia (Efecty, D.A.N.A., Daviplata, Nequi). Todos los pagos se procesan de forma segura por Square o el proveedor correspondiente. Los datos de tu tarjeta nunca se almacenan en nuestros servidores.",
      },
      {
        title: "5. Envíos y entregas",
        body: [
          "Enviamos a todo el mundo desde Bogotá, Colombia con guía rastreada. Los tiempos estimados de entrega se muestran al checkout, pero no son garantizados — pueden ocurrir retrasos por aduanas, clima o inconvenientes del transportador.",
          "Los derechos de importación, IVA y tariffs aduaneros son responsabilidad del comprador y no están incluidos en el precio del producto.",
        ],
      },
      {
        title: "6. Devoluciones y reembolsos",
        body:
          "Tienes 30 días desde la recepción para solicitar una devolución. Los artículos deben estar sin usar, en su empaque original y en la misma condición en que los recibiste. Consulta nuestra Política de Reembolsos para más detalles. Artículos personalizados o hechos a pedido no son elegibles.",
      },
      {
        title: "7. Propiedad intelectual",
        body:
          "Todo el contenido de este sitio — logos, fotografía, textos, diseños — es propiedad de AREM WORLD o sus licenciantes, salvo lo indicado. No puedes reproducir, distribuir o modificar el contenido sin permiso previo por escrito. El logo AR❀EM y las marcas relacionadas son marcas registradas de AREM WORLD.",
      },
      {
        title: "8. Limitación de responsabilidad",
        body:
          "Hasta el máximo permitido por la ley, nuestra responsabilidad por cualquier reclamo derivado del uso de este sitio o la compra de productos se limita al monto pagado por el producto. No somos responsables por daños indirectos, Incidentales o consecuentes.",
      },
      {
        title: "9. Ley aplicable",
        body:
          "Estos Términos se rigen por las leyes de Colombia. Cualquier disputa se somete a los juzgados competentes de Bogotá, Colombia, con renuncia expresa a cualquier otra jurisdicción.",
      },
      {
        title: "10. Cambios a estos términos",
        body:
          "Podemos actualizar estos Términos periódicamente. Los cambios entran en vigor al publicar. El uso continuo del sitio después de los cambios constituye aceptación.",
      },
    ],
    cookies: [
      {
        title: "1. ¿Qué son las cookies?",
        body:
          "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Las usamos para que el sitio funcione correctamente y para entender cómo usan los visitantes el sitio.",
      },
      {
        title: "2. Cookies que usamos",
        body: [
          "Esenciales (siempre activas): cookies necesarias para que el sitio funcione — preferencia de idioma, contenido del carrito, gestión de sesión. No se pueden desactivar.",
          "Analíticas (opcionales): usamos Vercel Analytics para recolectar datos de uso de forma anónima. No se almacenan identificadores personales. Esto nos ayuda a mejorar el rendimiento y la experiencia.",
          "No usamos cookies de publicidad: no tenemos cookies publicitarias de terceros, píxeles de remarketing ni scripts de seguimiento de redes sociales.",
        ],
      },
      {
        title: "3. Consentimiento",
        body:
          "En tu primera visita aparecerá un aviso en la parte inferior pidiéndote que aceptes o rechaces las cookies no esenciales. Las cookies esenciales se usan sin importar tu elección. Puedes cambiar tu preferencia en cualquier momento desde el enlace del pie de página.",
      },
      {
        title: "4. Servicios de terceros",
        body: [
          "Nuestra página puede contener enlaces a Instagram. No somos responsables por las prácticas de privacidad de sitios externos.",
          "Square (procesador de pagos) y Resend (proveedor de email) pueden colocar sus propias cookies en sus dominios — consulta sus respectivas políticas.",
        ],
      },
      {
        title: "5. Gestionar cookies",
        body:
          "Puedes desactivar las cookies en la configuración de tu navegador, pero esto puede romper funcionalidades esenciales (por ejemplo, el carrito de compras).",
      },
    ],
    refunds: [
      {
        title: "1. Nuestra promesa",
        body:
          "Creamos cada pieza con cuidado. Si no estás completamente satisfecho, ofrecemos una ventana de 30 días para devoluciones desde que recibes tu pedido.",
      },
      {
        title: "2. Elegibilidad",
        body: [
          "Los artículos deben estar sin usar, sin haberse usado, en condición original con todas las etiquetas y empaque intactos.",
          "Artículos personalizados, hechos a pedido o sobridos no son elegibles para devoluciones ni cambios.",
          "Artículos de oferta o con descuento son definitivos y no pueden devolverse salvo que lleguen defectuosos.",
          "Los aretes no son devolubles por razones de higiene, salvo que lleguen defectuosos.",
        ],
      },
      {
        title: "3. Cómo iniciar una devolución",
        body: [
          "Escribe a hola@arem.world dentro de los 30 días posteriores a la entrega con tu número de pedido y la razón de la devolución.",
          "Te responderemos en 2 días hábiles con las instrucciones y la etiqueta pre-pagada donde aplique.",
          "No envíes el artículo sin autorización previa — las devoluciones sin confirmación serán rechazadas.",
        ],
      },
      {
        title: "4. Proceso de reembolso",
        body: [
          "Una vez que recibamos e inspeccionemos el artículo devuelto, te notificaremos sobre la aprobación del reembolso en 5 días hábiles.",
          "Si es aprobado, el reembolso se procesa al método de pago original. El tiempo depende de tu banco o proveedor (normalmente 3–10 días hábiles).",
          "Los costos de envío son no reembolsables excepto en casos de artículos defectuosos o enviados por error.",
        ],
      },
      {
        title: "5. Cambios",
        body:
          "No ofrecemos cambios. Para obtener un artículo diferente, devuelve tu producto original y haz un nuevo pedido.",
      },
      {
        title: "6. Artículos defectuosos",
        body:
          "Si tu artículo llega dañado o defectuoso, contáctanos dentro de los 7 días posteriores a la entrega con fotos. Te enviaremos un reemplazo o un reembolso total, incluyendo envío.",
      },
    ],
  },
};

export function getLegalContent(locale: Locale): LegalContent {
  return legalContent[locale];
}
