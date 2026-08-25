/**
 * AREM WORLD — centralized UI dictionary (EN default / ES secondary).
 *
 * Every interface string that is not part of the content model lives here so
 * translations stay in one place. Content (products, categories, regions,
 * stories, homepage…) is localized inside `lib/content` with the same
 * `{ en, es }` pattern, ready for Admin-managed content in a later phase.
 */

import { defaultLocale, type Locale } from "@/lib/i18n/config";

export interface Dictionary {
  nav: {
    shop: string;
    collections: string;
    stories: string;
    regions: string;
    about: string;
    contact: string;
  };
  a11y: {
    openMenu: string;
    closeMenu: string;
    wishlist: string;
    cart: string;
    closeCart: string;
    decreaseQty: string;
    increaseQty: string;
    remove: string;
    addToWishlist: string;
    removeFromWishlist: string;
    viewImage: string;
    language: string;
    search: string;
  };
  common: {
    home: string;
    explore: string;
    viewAll: string;
    viewCollection: string;
    readStory: string;
    pieces: (count: number) => string;
    products: (count: number) => string;
    theirStories: string;
  };
  shop: {
    eyebrow: string;
    allTitle: string;
    allSub: string;
    categories: string;
    all: string;
    sort: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    empty: string;
  };
  product: {
    addToCart: string;
    soldOut: string;
    available: (count: number) => string;
    originalPrice: string;
    origin: string;
    artisan: string;
    viewStories: string;
    collections: string;
    sku: string;
    inventoryNote: string;
    storyTitle: string;
    detailsTitle: string;
    relatedEyebrow: string;
    relatedTitle: string;
    galleryNote: string;
    newBadge: string;
  };
  cart: {
    title: string;
    empty: string;
    viewFull: string;
    checkoutLater: string;
    yourSelection: string;
    lines: (count: number) => string;
    clear: string;
    summary: string;
    subtotal: string;
    shipping: string;
    shippingNote: string;
    freeShipping: string;
    total: string;
    checkoutBtn: string;
    paymentsNote: string;
    keepShopping: string;
  };
  wishlist: {
    title: string;
    yourFavorites: string;
    empty: string;
    saved: (count: number) => string;
    clear: string;
  };
  forms: {
    newsletterEmail: string;
    subscribe: string;
    newsletterSuccess: string;
    newsletterNote: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    topicOrder: string;
    topicProduct: string;
    topicArtisan: string;
    topicWholesale: string;
    topicOther: string;
    send: string;
    success: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    sub: string;
    otherWays: string;
    otherWaysSub: string;
    hours: string;
    hoursValue: string;
    sendMessage: string;
  };
  stories: {
    eyebrow: string;
    title: string;
    sub: string;
    featuredBadge: string;
    readStory: string;
    backToStories: string;
    piecesBy: (name: string) => string;
  };
  regions: {
    eyebrow: string;
    title: string;
    sub: string;
    handsOf: (name: string) => string;
    piecesOf: (name: string) => string;
  };
  heroStats: {
    artisans: string;
    municipalities: string;
    handmade: string;
  };
  collections: {
    eyebrow: string;
    title: string;
    sub: string;
    filling: string;
  };
  notFound: {
    code: string;
    title: string;
    sub: string;
    home: string;
    exploreShop: string;
  };
  meta: {
    notFoundProduct: string;
    notFoundCollection: string;
    notFoundStory: string;
    notFoundRegion: string;
  };
  footer: {
    explore: string;
    brand: string;
    help: string;
    contact: string;
    bottomNote: string;
  };
  account: {
    myAccount: string;
    overview: string;
    profile: string;
    addresses: string;
    wishlist: string;
    orders: string;
    security: string;
    signIn: string;
    signUp: string;
    signOut: string;
    backToShop: string;
    signInTitle: string;
    signInSub: string;
    signUpTitle: string;
    signUpSub: string;
    forgotTitle: string;
    forgotSub: string;
    resetTitle: string;
    resetSub: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredLanguage: string;
    languageEn: string;
    languageEs: string;
    save: string;
    saving: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    confirmDelete: string;
    profileTitle: string;
    profileSub: string;
    profileSaved: string;
    addressesTitle: string;
    addressesSub: string;
    addAddress: string;
    editAddress: string;
    recipientName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    defaultShipping: string;
    defaultBilling: string;
    addressSaved: string;
    addressDeleted: string;
    wishlistTitle: string;
    wishlistSub: string;
    wishlistSaved: string;
    wishlistAccount: string;
    ordersTitle: string;
    ordersSub: string;
    noOrders: string;
    orderNumber: string;
    orderDate: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    items: string;
    quantity: string;
    price: string;
    shippingAddress: string;
    trackingNumber: string;
    trackingPending: string;
    shipmentTimeline: string;
    backToOrders: string;
    statusPendingPayment: string;
    statusPaid: string;
    statusProcessing: string;
    statusShipped: string;
    statusDelivered: string;
    statusCancelled: string;
    statusRefunded: string;
    paymentPending: string;
    paymentPaid: string;
    paymentRefunded: string;
    paymentFailed: string;
    securityTitle: string;
    securitySub: string;
    currentPassword: string;
    newPassword: string;
    changePassword: string;
    passwordChanged: string;
    invalidCredentials: string;
    emailExists: string;
    passwordTooShort: string;
    emailInvalid: string;
    accountCreated: string;
    welcomeBack: string;
    loading: string;
    total: string;
  };
}

const en: Dictionary = {
  nav: {
    shop: "Shop",
    collections: "Collections",
    stories: "Stories",
    regions: "Regions",
    about: "About",
    contact: "Contact",
  },
  a11y: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    wishlist: "Wishlist",
    cart: "Cart",
    closeCart: "Close cart",
    decreaseQty: "Decrease quantity",
    increaseQty: "Increase quantity",
    remove: "Remove",
    addToWishlist: "Add to wishlist",
    removeFromWishlist: "Remove from wishlist",
    viewImage: "View image",
    language: "Language",
    search: "Search",
  },
  common: {
    home: "Home",
    explore: "Explore",
    viewAll: "View all",
    viewCollection: "View collection",
    readStory: "Read the story",
    pieces: (count) => `${count} ${count === 1 ? "piece" : "pieces"}`,
    products: (count) => `${count} ${count === 1 ? "product" : "products"}`,
    theirStories: "Their stories",
  },
  shop: {
    eyebrow: "The shop",
    allTitle: "All products",
    allSub: "Every piece is handmade by Colombian artisans and ships with its story.",
    categories: "Categories",
    all: "All",
    sort: "Sort",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortName: "Name: A–Z",
    empty: "There are no products in this category yet. Check back soon.",
  },
  product: {
    addToCart: "Add to cart",
    soldOut: "Sold out",
    available: (count) => `${count} available`,
    originalPrice: "Original price:",
    origin: "Origin",
    artisan: "Artisan",
    viewStories: "view stories",
    collections: "Collections",
    sku: "SKU",
    inventoryNote: "Inventory managed per variant",
    storyTitle: "The story of this piece",
    detailsTitle: "Details & care",
    relatedEyebrow: "You may also like",
    relatedTitle: "Related pieces",
    galleryNote: "Placeholder artwork — real photography arrives at launch.",
    newBadge: "New",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty for now.",
    viewFull: "View full cart",
    checkoutLater: "Checkout and payments arrive in a later phase.",
    yourSelection: "Your selection",
    lines: (count) => `${count} ${count === 1 ? "line" : "lines"}`,
    clear: "Clear cart",
    summary: "Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingNote: "Calculated at checkout",
    freeShipping: "Free",
    total: "Estimated total",
    checkoutBtn: "Checkout — coming soon",
    paymentsNote: "Payments, shipping and orders arrive in a later phase.",
    keepShopping: "Continue shopping",
  },
  wishlist: {
    title: "Wishlist",
    yourFavorites: "Your favorites",
    empty: "No favorites yet. Tap the heart on any piece to save it here.",
    saved: (count) => `${count} ${count === 1 ? "piece saved" : "pieces saved"}`,
    clear: "Clear wishlist",
  },
  forms: {
    newsletterEmail: "Your email address",
    subscribe: "Subscribe",
    newsletterSuccess: "Thank you! We'll write when there is something beautiful to tell you.",
    newsletterNote: "No spam, ever. Unsubscribe anytime.",
    name: "Name",
    email: "Email address",
    topic: "Topic",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "Tell us how we can help…",
    topicOrder: "Question about an order",
    topicProduct: "Question about a product",
    topicArtisan: "I want to work with AREM",
    topicWholesale: "Wholesale inquiries",
    topicOther: "Other",
    send: "Send message",
    success: "Message sent. We'll reply within 24 business hours.",
  },
  contact: {
    eyebrow: "Let's talk",
    title: "Contact",
    sub: "Questions about a piece, an order or a partnership with artisans? Write to us — we reply within 24 business hours.",
    otherWays: "Other channels",
    otherWaysSub: "Prefer to write directly? You can also reach us or visit us in Bogotá.",
    hours: "Hours",
    hoursValue: "Mon – Fri · 9:00 – 18:00",
    sendMessage: "Send us a message",
  },
  stories: {
    eyebrow: "The craft journal",
    title: "Stories",
    sub: "Behind every piece there is a land, a technique and a person. These are their voices.",
    featuredBadge: "Featured story",
    readStory: "Read the story",
    backToStories: "Back to stories",
    piecesBy: (name) => `Pieces by ${name}`,
  },
  regions: {
    eyebrow: "The map of craft",
    title: "Regions",
    sub: "Colombia fits in a single glance: the desert that weaves, the mountain that grows, the coast that rests. These are the lands of our artisans.",
    handsOf: (name) => `Hands of ${name.split(" ")[0]}`,
    piecesOf: (name) => `Pieces from ${name.split(" ")[0]}`,
  },
  heroStats: {
    artisans: "artisans",
    municipalities: "municipalities",
    handmade: "handmade",
  },
  collections: {
    eyebrow: "Curated edits",
    title: "Collections",
    sub: "Groups of pieces that tell a story: heritage, craft, origin and the coast.",
    filling: "This collection is filling up. Check back soon.",
  },
  notFound: {
    code: "Error 404",
    title: "This page doesn't exist",
    sub: "Maybe the piece sold out, the story moved, or you simply wandered off. Let's go back to the beginning.",
    home: "Go home",
    exploreShop: "Explore the shop",
  },
  meta: {
    notFoundProduct: "Product not found",
    notFoundCollection: "Collection not found",
    notFoundStory: "Story not found",
    notFoundRegion: "Region not found",
  },
  footer: {
    explore: "Explore",
    brand: "Brand",
    help: "Help",
    contact: "Contact",
    bottomNote: "Handmade · Paid with pride",
  },
  account: {
    myAccount: "My account",
    overview: "Overview",
    profile: "Profile",
    addresses: "Addresses",
    wishlist: "Wishlist",
    orders: "Orders",
    security: "Security",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    backToShop: "Back to the shop",
    signInTitle: "Welcome back",
    signInSub: "Sign in to manage your profile, addresses and orders.",
    signUpTitle: "Create your account",
    signUpSub: "Save your favorites and order history in one place.",
    forgotTitle: "Reset your password",
    forgotSub: "Enter your email and we'll send you a reset link.",
    resetTitle: "Choose a new password",
    resetSub: "Your old password is no longer valid.",
    resetPassword: "Update password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    preferredLanguage: "Preferred language",
    languageEn: "English",
    languageEs: "Español",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    confirmDelete: "Confirm deletion",
    profileTitle: "Profile",
    profileSub: "Your personal details and preferences.",
    profileSaved: "Profile updated.",
    addressesTitle: "Address book",
    addressesSub: "Manage your shipping and billing addresses.",
    addAddress: "Add address",
    editAddress: "Edit address",
    recipientName: "Recipient name",
    addressLine1: "Address line 1",
    addressLine2: "Address line 2",
    city: "City",
    state: "State / region",
    postalCode: "Postal code",
    country: "Country",
    defaultShipping: "Default shipping",
    defaultBilling: "Default billing",
    addressSaved: "Address saved.",
    addressDeleted: "Address deleted.",
    wishlistTitle: "Your wishlist",
    wishlistSub: "Favorites saved to your account.",
    wishlistSaved: "Saved to your account.",
    wishlistAccount: "This wishlist is stored securely in your account.",
    ordersTitle: "Your orders",
    ordersSub: "Track and review your orders.",
    noOrders: "You have no orders yet.",
    orderNumber: "Order",
    orderDate: "Date",
    paymentStatus: "Payment",
    fulfillmentStatus: "Fulfillment",
    items: "Items",
    quantity: "Qty",
    price: "Price",
    shippingAddress: "Shipping address",
    trackingNumber: "Tracking number",
    trackingPending: "Tracking will appear once your order ships.",
    shipmentTimeline: "Shipment status",
    backToOrders: "Back to orders",
    statusPendingPayment: "Pending payment",
    statusPaid: "Paid",
    statusProcessing: "Processing",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    statusRefunded: "Refunded",
    paymentPending: "Pending",
    paymentPaid: "Paid",
    paymentRefunded: "Refunded",
    paymentFailed: "Failed",
    securityTitle: "Security",
    securitySub: "Update your password.",
    currentPassword: "Current password",
    newPassword: "New password",
    changePassword: "Change password",
    passwordChanged: "Password updated.",
    invalidCredentials: "Invalid email or password.",
    emailExists: "An account with this email already exists.",
    passwordTooShort: "Password must be at least 8 characters.",
    emailInvalid: "Enter a valid email address.",
    accountCreated: "Account created.",
    welcomeBack: "Signed in. Welcome back.",
    loading: "Loading…",
    total: "Total",
  },
};

const es: Dictionary = {
  nav: {
    shop: "Tienda",
    collections: "Colecciones",
    stories: "Historias",
    regions: "Regiones",
    about: "Nosotros",
    contact: "Contacto",
  },
  a11y: {
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    wishlist: "Favoritos",
    cart: "Carrito",
    closeCart: "Cerrar carrito",
    decreaseQty: "Disminuir cantidad",
    increaseQty: "Aumentar cantidad",
    remove: "Quitar",
    addToWishlist: "Agregar a favoritos",
    removeFromWishlist: "Quitar de favoritos",
    viewImage: "Ver imagen",
    language: "Idioma",
    search: "Buscar",
  },
  common: {
    home: "Inicio",
    explore: "Explorar",
    viewAll: "Ver todo",
    viewCollection: "Ver colección",
    readStory: "Leer la historia",
    pieces: (count) => `${count} ${count === 1 ? "pieza" : "piezas"}`,
    products: (count) => `${count} ${count === 1 ? "producto" : "productos"}`,
    theirStories: "Sus historias",
  },
  shop: {
    eyebrow: "La tienda",
    allTitle: "Toda la tienda",
    allSub: "Cada pieza está hecha a mano por artesanos colombianos y se envía con su historia.",
    categories: "Categorías",
    all: "Todo",
    sort: "Ordenar",
    sortFeatured: "Destacados",
    sortPriceAsc: "Precio: menor a mayor",
    sortPriceDesc: "Precio: mayor a menor",
    sortName: "Nombre: A–Z",
    empty: "No hay productos en esta categoría todavía. Vuelve pronto.",
  },
  product: {
    addToCart: "Agregar al carrito",
    soldOut: "Agotado",
    available: (count) => `${count} disponibles`,
    originalPrice: "Precio original:",
    origin: "Origen",
    artisan: "Artesano",
    viewStories: "ver historias",
    collections: "Colecciones",
    sku: "SKU",
    inventoryNote: "Inventario gestionado por variante",
    storyTitle: "La historia de esta pieza",
    detailsTitle: "Detalles y cuidados",
    relatedEyebrow: "Te puede gustar",
    relatedTitle: "Piezas relacionadas",
    galleryNote: "Arte placeholder — la fotografía real llega en el lanzamiento.",
    newBadge: "Nuevo",
  },
  cart: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío por ahora.",
    viewFull: "Ver carrito completo",
    checkoutLater: "El checkout y los pagos llegarán en una fase posterior.",
    yourSelection: "Tu selección",
    lines: (count) => `${count} ${count === 1 ? "línea" : "líneas"}`,
    clear: "Vaciar carrito",
    summary: "Resumen",
    subtotal: "Subtotal",
    shipping: "Envío",
    shippingNote: "Se calcula al finalizar",
    freeShipping: "Gratis",
    total: "Total estimado",
    checkoutBtn: "Finalizar compra — próximamente",
    paymentsNote: "Pagos, envío y órdenes llegan en una fase posterior.",
    keepShopping: "Seguir explorando",
  },
  wishlist: {
    title: "Favoritos",
    yourFavorites: "Tus favoritas",
    empty: "Aún no tienes favoritos. Toca el corazón de cualquier pieza para guardarla aquí.",
    saved: (count) => `${count} ${count === 1 ? "pieza guardada" : "piezas guardadas"}`,
    clear: "Limpiar favoritos",
  },
  forms: {
    newsletterEmail: "Tu correo electrónico",
    subscribe: "Suscribirme",
    newsletterSuccess: "¡Gracias! Te avisaremos cuando haya algo hermoso que contarte.",
    newsletterNote: "Sin spam, nunca. Puedes darte de baja cuando quieras.",
    name: "Nombre",
    email: "Correo electrónico",
    topic: "Motivo",
    message: "Mensaje",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tucorreo@ejemplo.com",
    messagePlaceholder: "Cuéntanos en qué podemos ayudarte…",
    topicOrder: "Información de un pedido",
    topicProduct: "Pregunta sobre un producto",
    topicArtisan: "Quiero trabajar con AREM",
    topicWholesale: "Compras al por mayor",
    topicOther: "Otro",
    send: "Enviar mensaje",
    success: "Mensaje enviado. Te responderemos en menos de 24 horas hábiles.",
  },
  contact: {
    eyebrow: "Hablemos",
    title: "Contacto",
    sub: "¿Preguntas sobre una pieza, un pedido o una alianza con artesanos? Escríbenos — respondemos en menos de 24 horas hábiles.",
    otherWays: "Otras vías",
    otherWaysSub: "Si prefieres, también puedes escribirnos directamente o visitarnos en Bogotá.",
    hours: "Horario",
    hoursValue: "Lun – Vie · 9:00 – 18:00",
    sendMessage: "Envíanos un mensaje",
  },
  stories: {
    eyebrow: "El diario del oficio",
    title: "Historias",
    sub: "Detrás de cada pieza hay una tierra, una técnica y una persona. Estas son sus voces.",
    featuredBadge: "Historia destacada",
    readStory: "Leer la historia",
    backToStories: "Volver a historias",
    piecesBy: (name) => `Piezas de ${name.split(" ")[0]}`,
  },
  regions: {
    eyebrow: "El mapa del oficio",
    title: "Regiones",
    sub: "Colombia cabe en una sola mirada: el desierto que teje, la montaña que cultiva, la costa que descansa. Estas son las tierras de nuestros artesanos.",
    handsOf: (name) => `Manos de ${name.split(" ")[0]}`,
    piecesOf: (name) => `Piezas de ${name.split(" ")[0]}`,
  },
  heroStats: {
    artisans: "artesanos",
    municipalities: "municipios",
    handmade: "hecho a mano",
  },
  collections: {
    eyebrow: "Ediciones curadas",
    title: "Colecciones",
    sub: "Grupos de piezas que cuentan una historia: la herencia, el oficio, el origen y la costa.",
    filling: "Esta colección se está llenando. Vuelve pronto.",
  },
  notFound: {
    code: "Error 404",
    title: "Esta página no existe",
    sub: "Quizá la pieza se vendió, la historia cambió de lugar, o simplemente te perdiste. Volvamos al inicio.",
    home: "Ir al inicio",
    exploreShop: "Explorar la tienda",
  },
  meta: {
    notFoundProduct: "Producto no encontrado",
    notFoundCollection: "Colección no encontrada",
    notFoundStory: "Historia no encontrada",
    notFoundRegion: "Región no encontrada",
  },
  footer: {
    explore: "Explorar",
    brand: "Marca",
    help: "Ayuda",
    contact: "Contacto",
    bottomNote: "Hecho a mano · Pagado con orgullo",
  },
  account: {
    myAccount: "Mi cuenta",
    overview: "Resumen",
    profile: "Perfil",
    addresses: "Direcciones",
    wishlist: "Favoritos",
    orders: "Pedidos",
    security: "Seguridad",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    signOut: "Cerrar sesión",
    backToShop: "Volver a la tienda",
    signInTitle: "Bienvenido de nuevo",
    signInSub: "Inicia sesión para gestionar tu perfil, direcciones y pedidos.",
    signUpTitle: "Crea tu cuenta",
    signUpSub: "Guarda tus favoritos y tu historial de pedidos en un solo lugar.",
    forgotTitle: "Restablece tu contraseña",
    forgotSub: "Ingresa tu correo y te enviaremos un enlace de restablecimiento.",
    resetTitle: "Elige una nueva contraseña",
    resetSub: "Tu contraseña anterior ya no es válida.",
    resetPassword: "Actualizar contraseña",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Teléfono",
    preferredLanguage: "Idioma preferido",
    languageEn: "English",
    languageEs: "Español",
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    add: "Añadir",
    confirmDelete: "Confirmar eliminación",
    profileTitle: "Perfil",
    profileSub: "Tus datos personales y preferencias.",
    profileSaved: "Perfil actualizado.",
    addressesTitle: "Libreta de direcciones",
    addressesSub: "Administra tus direcciones de envío y facturación.",
    addAddress: "Añadir dirección",
    editAddress: "Editar dirección",
    recipientName: "Nombre del destinatario",
    addressLine1: "Dirección línea 1",
    addressLine2: "Dirección línea 2",
    city: "Ciudad",
    state: "Departamento / región",
    postalCode: "Código postal",
    country: "País",
    defaultShipping: "Envío por defecto",
    defaultBilling: "Facturación por defecto",
    addressSaved: "Dirección guardada.",
    addressDeleted: "Dirección eliminada.",
    wishlistTitle: "Tus favoritos",
    wishlistSub: "Piezas guardadas en tu cuenta.",
    wishlistSaved: "Guardado en tu cuenta.",
    wishlistAccount: "Esta lista se guarda de forma segura en tu cuenta.",
    ordersTitle: "Tus pedidos",
    ordersSub: "Consulta y sigue tus pedidos.",
    noOrders: "Aún no tienes pedidos.",
    orderNumber: "Pedido",
    orderDate: "Fecha",
    paymentStatus: "Pago",
    fulfillmentStatus: "Cumplimiento",
    items: "Artículos",
    quantity: "Cant.",
    price: "Precio",
    shippingAddress: "Dirección de envío",
    trackingNumber: "Número de seguimiento",
    trackingPending: "El seguimiento aparecerá cuando tu pedido sea enviado.",
    shipmentTimeline: "Estado del envío",
    backToOrders: "Volver a pedidos",
    statusPendingPayment: "Pago pendiente",
    statusPaid: "Pagado",
    statusProcessing: "En preparación",
    statusShipped: "Enviado",
    statusDelivered: "Entregado",
    statusCancelled: "Cancelado",
    statusRefunded: "Reembolsado",
    paymentPending: "Pendiente",
    paymentPaid: "Pagado",
    paymentRefunded: "Reembolsado",
    paymentFailed: "Fallido",
    securityTitle: "Seguridad",
    securitySub: "Actualiza tu contraseña.",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    changePassword: "Cambiar contraseña",
    passwordChanged: "Contraseña actualizada.",
    invalidCredentials: "Correo o contraseña inválidos.",
    emailExists: "Ya existe una cuenta con este correo.",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
    emailInvalid: "Ingresa un correo válido.",
    accountCreated: "Cuenta creada.",
    welcomeBack: "Sesión iniciada. Bienvenido de nuevo.",
    loading: "Cargando…",
    total: "Total",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
